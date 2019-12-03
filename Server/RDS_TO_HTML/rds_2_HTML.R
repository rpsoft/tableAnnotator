library(tidyxl)
library(unpivotr)
library(tidyverse)
library(htmlTable)

new_obj_backup <- readRDS("/home/suso/ihw/tableAnnotator/tools/RDS_TO_HTML/new_obj.rds")

prevcolnames <- new_obj_backup %>% colnames()

new_obj <- readRDS("/home/suso/ihw/tableAnnotator/tools/RDS_TO_HTML/newTables/Full_set_of_tables.Rds")


## Prepare the missing table on the fly
# readxl::read_excel("/home/suso/ihw/tableAnnotator/tools/SortingTables/26578849_2.xlsx")
x <- xlsx_cells("/home/suso/ihw/tableAnnotator/tools/SortingTables/26578849_2.xlsx")
x <- x %>% mutate( sheet = "26578849_2")
x <- x %>% mutate ( search_round = "jesus_fix", bold = NA, italic = NA, indent = FALSE, is_empty = is_blank, has_no_num = NA, tbl_n  = 2, file_name = "26578849_2.xlsx",  blank_row = NA, first_col = NA, first_last_col = NA, original_file_stored = "26578849_2.xlsx",  pmid = 26578849, pmid_tbl = "26578849_2", ticker = 1, indent_lvl = 0  )

new_obj <- new_obj %>% filter (!(pmid == "26578849" & tbl_n == 2) )
new_obj <- new_obj %>% rbind(x %>% select(new_obj %>% colnames))
new_obj <- new_obj %>% mutate ( pmid = ifelse( sheet == "30425095b", "30425095b", pmid  ))

new_obj <- new_obj %>% mutate( pmid_tbl=paste0(pmid,"_",tbl_n))

new_obj <- new_obj %>% filter (!(pmid == "pmid"))

filenames_lkp <- new_obj %>% select(pmid,search_round,tbl_n,file_name,original_file_stored) %>% distinct %>% mutate(n = 1) %>% group_by(pmid,tbl_n) %>% mutate(ticker = cumsum(n))

new_obj <- new_obj %>% inner_join(filenames_lkp) %>% select(-n) 

new_obj <- new_obj %>% mutate(pmid_tbl = ifelse(ticker > 1, gsub(" ", "", paste(pmid,"v",ticker,"_",tbl_n), fixed = TRUE), pmid_tbl) )

filenames <- new_obj %>% select(pmid_tbl) %>% distinct
new_obj <- new_obj %>% mutate(indent_lvl = ifelse(indent, 1, 0))

new_obj <- new_obj %>% distinct()

new_obj %>% saveRDS("~/ihw/tableAnnotator/Server/src/Full_set_of_tables_Prepared.Rds")

df_to_html <- function (tbl_id, df, destination){
      
      atable <- new_obj %>% filter ( pmid_tbl == tbl_id)
      
      ex <- atable

      cols <- (ex %>% dim())[2]
      
      ex[1:cols][ is.na(ex[1:cols]) ] <-FALSE
      
      ex <- ex %>%
        mutate_if(is.character, function(x) x %>%
                    stringi::stri_enc_toutf8())
      
      headers <- '<div class="headers"><div>'
      
      for (r in 1:max(ex$row)){
        
        rowText <- (ex %>% filter(row == r) %>% filter(character != FALSE) )$character
        
        txtl <- str_length(str_replace_all(str_replace_all(paste0(rowText, collapse= ","),"FALSE",""),",",""))

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
          character = if_else(bold, paste0('bold ', character), character),
          character = if_else(indent, paste0('indent',indent_lvl,' ', character), character),
          character = if_else(italic, paste0('italic ', character), character),
          character = if_else(first_col, paste0('firstCol ', character), character),
          character = if_else(first_last_col, paste0('firstLastCol ', character), character),
          character = paste0('" class="',character),
          
          character = if_else(indent, paste0('padding-left:',indent_lvl*20,'px; ', character), character),
          character = if_else(bold, paste0('font-weight: bold; ', character), character),
          character = if_else(italic, paste0('font-style: italic; ', character), character),
          character = paste0('<p style="',character)
        )
      
      # html_res <- htmlTable::htmlTable(rectify( ex ),
      #                                  align = paste(rep('l',ncol(ex)),collapse=''), rnames=FALSE)
      # 
      rectify( ex %>% distinct ) -> tab
      tab$"row/col" <- NULL
      unname(tab) -> tab
      
      html_res <- htmlTable::htmlTable(tab,
                           align = paste(rep('l',ncol(ex)),collapse=''), rnames=FALSE)
      
      
      html_res = paste0(headers, html_res)
      
      html_res %>% write(paste0(destination, tbl_id ,".html"))
}


for (r in 1:nrow(filenames)){

  tryCatch({
    print(filenames[r,]$pmid_tbl)
    df_to_html(filenames[r,]$pmid_tbl, new_obj, "/home/suso/ihw/tableAnnotator/Server/HTML_TABLES/")
  }, error = function(e) print(paste0("ERROR: ",filenames[r,]$pmid_tbl, e)))
  
}


# show missing tables, I.e. not rendered into an HTML file
filenames %>% mutate(pmid_tbl=paste0(pmid_tbl,".html")) %>% filter(! (pmid_tbl %in% dir("/home/suso/ihw/tableAnnotator/Server/HTML_TABLES/")))  
