library(readr)
library(tidyverse)
library(dplyr)
library(filesstrings)

## this file is used to take away all tables that have been correctly annotated already from the directory where all tables are located.

first_batch_results <- read_csv("ihw/tableAnnotator/annotations/first/first_batch_results.csv")

second_annotations <- read_csv("ihw/tableAnnotator/annotations/second/second_annotations.csv")
# third_annotations <- read_csv("ihw/tableAnnotator/annotations/third/third_annotations.csv")

#First batch did not have the corrupted_text variable. Only a binary corrupted one.
first_batch_results <- first_batch_results %>% mutate(corrupted_text = ifelse(corrupted, "something wrong with the table (First Batch Generic Message)", NA))
first_batch_results <- first_batch_results %>% select(second_annotations %>% colnames)

all_annotations_jul_2019 <- rbind ( first_batch_results, second_annotations)

write.csv(all_annotations_jul_2019, "ihw/tableAnnotator/annotations/all_annotations_jul_2019.csv", row.names=FALSE)

first_batch_results %>% View

first_annotations_good <- first_batch_results %>% filter(is.na(corrupted_text)) %>% select(docid,page) %>% distinct() 
second_annotations_good <- second_annotations %>% filter(is.na(corrupted_text)) %>% select(docid,page) %>% distinct() 

# third_annotations_good <- third_annotations %>% filter(is.na(corrupted_text)) %>% select(docid,page) %>% distinct() 


all_good_annotations <- rbind(first_annotations_good, second_annotations_good) %>% distinct() %>% mutate(compname = paste0(docid,"_",page))

all_distinct_annotations <- all_annotations_jul_2019 %>% mutate(compname = paste0(docid,"_",page)) %>%  select(docid,page,compname) %>% distinct() 

all_bad_annotations <- all_distinct_annotations %>% anti_join(all_good_annotations)


dirfiles <- dir("ihw/tableAnnotator/Server/HTML_TABLES") %>% data_frame()
colnames(dirfiles)[1] <- "filenames"

dir_files_df <- dirfiles %>% mutate(compname = str_replace(filenames, ".html", ""))  %>% mutate(compname= sub('v[0-9]','',compname) )

all_completed_annotations <- dir_files_df %>% left_join(all_good_annotations) %>% filter( !is.na(docid))

# dir_files_df %>% left_join(all_good_annotations) %>% filter( is.na(docid) ) %>% View

for ( f in all_completed_annotations$filenames){
  file.move(paste0("ihw/tableAnnotator/Server/HTML_TABLES/",f) , paste0("ihw/tableAnnotator/Server/HTML_TABLES_COMPLETED/"))
}

all_failed_annotations <- dir_files_df %>% left_join(all_bad_annotations) %>% filter( !is.na(docid))


for ( f in all_failed_annotations$filenames){
  file.move(paste0("ihw/tableAnnotator/Server/HTML_TABLES/",f) , paste0("ihw/tableAnnotator/Server/HTML_TABLES_FAILED/"))
}



