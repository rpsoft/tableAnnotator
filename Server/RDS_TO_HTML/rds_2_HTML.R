library(tidyxl)
library(unpivotr)
library(tidyverse)
library(htmlTable)

new_obj <- readRDS("~/Downloads/new_obj.rds")

atable <- new_obj %>% filter ( pmid_tbl == "24323795_2")

#atable %>% View
# atable %>% mutate(is_blank = if_else(is.na(is_blank), TRUE, is_blank),
#          data_type = if_else(is.na(data_type), "blank", data_type),
#          sheet = sheet[1],
#          address = paste0(LETTERS[row], col)) 
# 

atable %<>%  select(sheet, address, row, col, is_blank, character, bold, italic, indent, data_type,indent_lvl) %>%
  mutate(is_empty   = is_blank | (!str_detect(character %>% str_to_lower(), "[:alnum:]")),
         has_no_num = is_blank | (!str_detect(character %>% str_to_lower(), "[0-9]")))


all_cells <- atable


BlankRow <- function (mydf) {
  empty_rows <- mydf %>%
    arrange(row, col) %>%
    group_by(row) %>%
    summarise(blank_row = all(is_empty)) %>%
    ungroup() %>%
    filter(blank_row) %>%
    distinct(row) %>%
    pull(row)
}



## Identify split_header_row as the last empty row IN the first set of contiguos empty rows
empty_rows <- BlankRow(all_cells)
null_rows <- setdiff(1:max(all_cells$row), all_cells$row)
empty_rows <- c(empty_rows, null_rows) %>%
  sort()
empty_rows <- tibble(empty_rows = empty_rows, diff = lead(empty_rows, default = 1000L) - empty_rows)
empty_rows <- empty_rows %>%
  filter(diff != 1)
split_header <- empty_rows$empty_rows[1]

# Next identify any rows which are completely blank 
blank_row <- all_cells %>%
  BlankRow()

# Those which have no information after removing the first column, except a little text in some of the second columns
first_col_1 <- all_cells %>%
  filter(!col %in% 1:2) %>%
  BlankRow()
first_col_1_spill <- all_cells %>%
  filter(col == 2, has_no_num) %>%
  distinct(row) %>%
  pull(row)
## This allows for text only, but not numbers in the second column
first_col <- intersect(first_col_1, first_col_1_spill)

# Those which have no information after removing the first and last column
first_last_col <- all_cells %>%
  group_by(row) %>%
  mutate(col_max = max(col)) %>%
  ungroup() %>%
  filter(!col %in% 1:2, col != col_max) %>%
  BlankRow()
first_last_col  <- intersect(first_last_col, first_col_1_spill)

# Those which have only one cell containing information, after removing the first and last column,
# and which are long rows (>= 4 blank cells)
first_last_col_wide <- all_cells %>%
  group_by(row) %>%
  mutate(col_max = max(col)) %>%
  ungroup() %>%
  filter(!col %in% 1:2, col != col_max) %>%
  group_by(row) %>%
  summarise(few_p = sum(is_blank) >= 4) %>%
  filter(few_p) %>%
  pull(row)

first_last_col_wide <- intersect(first_last_col_wide, first_col_1_spill)
first_last_col <- union(first_last_col, first_last_col_wide)

first_col <- setdiff(first_col, blank_row)
first_last_col <- setdiff(first_last_col, c(first_col, blank_row))

## Add these onto all_cells
all_cells <- all_cells %>%
  mutate(blank_row = row %in% blank_row,
         first_col = row %in% first_col,
         first_last_col = row %in% first_last_col)


ex <- all_cells


cols <- (ex %>% dim())[2]

ex[1:cols][ is.na(ex[1:cols]) ] <-FALSE

ex <- ex %>%
  mutate_if(is.character, function(x) x %>%
              stringi::stri_enc_toutf8())

ex <- ex %>%
  mutate(
    
    # character = if_else(bold, paste0('<p style="font-weight: bold;" > ',character, "</p>"), character)
    character = paste0('">',character,"</p>"),
    character = if_else(indent, paste0('indent',indent_lvl,' ', character), character),
    character = if_else(italic, paste0('italic ', character), character),
    character = if_else(first_col, paste0('firstCol ', character), character),
    character = if_else(first_last_col, paste0('firstLastCol ', character), character),
    character = paste0('<p class="',character)
  )



# headers <- paste0('<div class="headers"><div>',paste0(ex[[1]][!is.na(ex[[1]])],collapse = "</div><div>"),"</div></div>")
headers <- ""

rectify( ex )

align = paste(rep('l',ncol(ex)))

collapse=''

html_res <- htmlTable::htmlTable( matrix(ex) )

html_res = paste0(headers, html_res)

html_res %>% write(paste0(htmlFolder,table_name %>% str_replace(".xlsx",""),".html"))

