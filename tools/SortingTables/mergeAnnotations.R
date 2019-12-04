library(tidyverse)
library(readr)
first_batch_results <- read_csv("~/ihw/tableAnnotator/annotations/first/first_batch_results.csv") %>% mutate( pmid_tbl=paste0(docid,"_",page))

second_annotations <- read_csv("~/ihw/tableAnnotator/annotations/second/second_annotations.csv") %>% mutate( pmid_tbl=paste0(docid,"_",page))

third_batch_results <- read_csv("~/ihw/tableAnnotator/annotations/third/third_batch_results.csv") %>% mutate( pmid_tbl=paste0(docid,"_",page))

first_n <- first_batch_results %>% distinct(pmid_tbl) %>% nrow #722

second_n <- second_annotations %>% distinct(pmid_tbl) %>% nrow #228

third_n <- third_batch_results %>% distinct(pmid_tbl) %>% nrow #919

first_n+second_n+third_n

setdiff(first_batch_results$pmid_tbl, second_annotations$pmid_tbl ) %>% length() # 604 different ones.
intersect(first_batch_results$pmid_tbl, second_annotations$pmid_tbl ) %>% length() ## First and second batch overlap over 118 annotations. # This was because we reinserted tables that failed I think

first_and_second_tables <- first_batch_results %>% distinct(pmid_tbl) %>% rbind ( second_annotations %>% distinct(pmid_tbl) )

first_and_second_tables %>% distinct %>% nrow ## first and second annotation runs produced 832 unique annotations

intersect(first_and_second_tables$pmid_tbl, (third_batch_results %>% distinct(pmid_tbl))$pmid_tbl) %>% length # overlap of 9 with respect of previous runs
setdiff((third_batch_results %>% distinct(pmid_tbl))$pmid_tbl, first_and_second_tables$pmid_tbl ) %>% length # 910 newly annotated tables in run 3.

first_batch_results %>% distinct(pmid_tbl) %>% 
  rbind(second_annotations %>% distinct(pmid_tbl)) %>%
  rbind(third_batch_results %>% distinct(pmid_tbl)) %>% distinct %>% nrow


## These are the imported ones.
all_annotations_OCT_2019 <- read_delim("~/ihw/tableAnnotator/tools/all_annotations_OCT_2019.csv", 
                                       ";", escape_double = FALSE, trim_ws = TRUE)

all_annotations_OCT_2019 %>% mutate( pmid_tbl=paste0(docid,"_",page)) %>% distinct(pmid_tbl) %>% nrow # 1749 unique pmid_tbl combinations.

all_annotations_OCT_2019 %>% mutate( pmid_tbl=paste0(docid,"_",page)) %>% distinct(pmid_tbl) %>% filter ( str_detect(pmid_tbl, " &") ) 



