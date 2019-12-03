## Check table numbers
library(tidyverse)
library(readr)
library(dplyr)

tables_dataset <- readRDS("/home/suso/ihw/tableAnnotator/tools/RDS_TO_HTML/newTables/clean_full_tables_rds_jul_2019.rds")

tables_dataset %>% select(sheet,tbl_n) %>% distinct   ## 1776 different pmid+tbl_n combinations


