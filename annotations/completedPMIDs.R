library(readr)
library(tidyverse)
library(dplyr)
library(filesstrings)

## this file is used to take away all tables that have been correctly annotated already from the directory where all tables are located.

first_batch_results <- read_csv("ihw/tableAnnotator/annotations/first/first_batch_results.csv")
second_annotations <- read_csv("ihw/tableAnnotator/annotations/second/second_annotations.csv")
third_annotations <- read_delim("ihw/tableAnnotator/annotations/third/third_annotations.csv", 
                                ";", escape_double = FALSE, trim_ws = TRUE)

first_batch_results %>% colnames

first_annotations_good <- first_batch_results %>% filter(corrupted == FALSE) %>% select(docid,page) %>% distinct() 

second_annotations_good <- second_annotations %>% filter(is.na(corrupted_text)) %>% select(docid,page) %>% distinct() 

third_annotations_good <- third_annotations %>% mutate (corrupted_text = ifelse( corrupted_text == "undefined", NA, corrupted_text))  %>% filter(is.na(corrupted_text)) %>% select(docid,page) %>% distinct()


all_good_annotations <- rbind(first_annotations_good, second_annotations_good, third_annotations_good) %>% distinct() %>% mutate(compname = paste0(docid,"_",page))

dirfiles <- dir("ihw/tableAnnotator/Server/HTML_TABLES") %>% data_frame()
colnames(dirfiles)[1] <- "filenames"

dir_files_df <- dirfiles %>% mutate(compname = str_replace(filenames, ".html", ""))  %>% mutate(compname= sub('v[0-9]','',compname) )

all_completed_annotations <- dir_files_df %>% left_join(all_good_annotations) %>% filter( !is.na(docid))

# dir_files_df %>% left_join(all_good_annotations) %>% filter( is.na(docid) ) %>% View

for ( f in all_completed_annotations$filenames){
  file.move(paste0("ihw/tableAnnotator/Server/HTML_TABLES/",f) , paste0("ihw/tableAnnotator/Server/HTML_TABLES_COMPLETED/"))
}

