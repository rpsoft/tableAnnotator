library(tidyxl)
library(unpivotr)
library(tidyverse)
library(htmlTable)

new_obj_backup <- readRDS("C:\\IHW\\tableAnnotator\\Server\\RDS_TO_HTML\\new_obj.rds")

prevcolnames <- new_obj_backup %>% colnames()

new_obj <- readRDS("C:/IHW/tableAnnotator/Server/newTables/Full_set_of_tables.Rds")

new_obj %>% colnames()

new_obj <- new_obj %>% mutate( pmid_tbl=paste0(pmid,"_",tbl_n))

filenames_lkp <- new_obj %>% select(pmid,search_round,tbl_n,file_name,original_file_stored) %>% distinct %>% mutate(n = 1) %>% group_by(pmid,tbl_n) %>% mutate(ticker = cumsum(n))

new_obj <- new_obj %>% inner_join(filenames_lkp) %>% select(-n) 
  
new_obj <- new_obj %>% mutate(pmid_tbl = ifelse(ticker > 1, gsub(" ", "", paste(pmid,"v",ticker,"_",tbl_n), fixed = TRUE), pmid_tbl) )

new_obj <- new_obj %>% mutate( indent_lvl=0)

filenames <- new_obj %>% select(pmid_tbl) %>% distinct


df_to_html <- function (tbl_id, df, destination){
      
      atable <- new_obj %>% filter ( pmid_tbl == tbl_id)
      
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
      
      
      
      ex_bk <- ex
      
      ex <- ex_bk
      # headers <- paste0('<div class="headers"><div>',paste0(ex[1,]$character,collapse = "</div><div>"),"</div></div>")
      
      headers <- '<div class="headers"><div>'
      
      for (r in 1:max(ex$row)){
        
        rowText <- (ex %>% filter(row == r) %>% filter(character != FALSE) )$character
        
        
        txtl <- str_length(str_replace_all(str_replace_all(paste0(rowText, collapse= ","),"FALSE",""),",",""))
        # print(txtl)
       
        #print(paste0(txtl,"  ", r))
         if ( txtl == 0 ) {
        
          ex <- ex %>% filter (! ( row %in% 1:r))
          break
        }
        
        
        headers <- paste0(headers, paste0( rowText ,collapse = "</div><div>" ))
        
      }
      
      headers <- paste0(headers,"</div></div>")
      
      
      
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
      
      
      
      html_res <- htmlTable::htmlTable(rectify( ex ),
                                       align = paste(rep('l',ncol(ex)),collapse=''))
      
      html_res = paste0(headers, html_res)
      
      html_res %>% write(paste0(destination, tbl_id ,".html"))
}


for (r in 1:nrow(filenames)){

  try({
    print(filenames[r,]$pmid_tbl)
    df_to_html(filenames[r,]$pmid_tbl, new_obj, "C:\\IHW\\tableAnnotator\\Server\\RDS_TO_HTML\\tables\\")
  })
  
}

new_obj %>% filter(pmid == "pmid") %>% View
