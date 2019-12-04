## Check table numbers
library(tidyverse)
library(readr)
library(dplyr)

tables_dataset <- readRDS("/home/suso/ihw/tableAnnotator/tools/RDS_TO_HTML/newTables/clean_full_tables_rds_jul_2019.rds")

tables_dataset %>% View


# tables_dataset %>% select(sheet,tbl_n) %>% distinct   ## 1776 different pmid+tbl_n combinations
all_annotations_OCT_2019 <- read.csv2("~/ihw/tableAnnotator/tools/all_annotations_OCT_2019.csv")

# all_annotations_OCT_2019 %>% arrange(docid,page) %>% View

# all_annotations_OCT_2019 %>% distinct(docid,page) %>% nrow

# all_annotations_OCT_2019 <- all_annotations_OCT_2019 %>% mutate (docid = sapply(strsplit(docid, " &"), "[", 1))


file_pmids <- data.frame( filename = list.files("/home/suso/ihw/tableAnnotator/Server/HTML_TABLES") ) %>% 
  separate(filename, c("pmid","page","html"))

unique_pmid_tables <- file_pmids %>% mutate( pmid_tbl=paste0(pmid,"_",page)) %>% distinct(pmid_tbl) 

unique_pmid_annotations <- all_annotations_OCT_2019 %>% mutate( pmid_tbl=paste0(docid,"_",page)) %>% distinct(pmid_tbl)

unique_pmid_annotations %>% nrow
unique_pmid_tables %>% nrow

setdiff(unique_pmid_annotations$pmid_tbl, unique_pmid_tables$pmid_tbl ) 
intersect(unique_pmid_annotations$pmid_tbl, unique_pmid_tables$pmid_tbl ) %>% length

unique_pmid_tables_noVs <- unique_pmid_tables %>% filter ( !str_detect(pmid_tbl, "v") )
unique_pmid_annotations_noVs <- unique_pmid_annotations %>% filter ( !str_detect(pmid_tbl, "v") )

unique_pmid_tables_noVs$pmid_tbl %>% length

setdiff(unique_pmid_annotations_noVs$pmid_tbl, unique_pmid_tables_noVs$pmid_tbl ) 
intersect(unique_pmid_annotations_noVs$pmid_tbl, unique_pmid_tables_noVs$pmid_tbl ) %>% length
