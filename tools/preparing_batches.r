library(tidyverse)
library(readr)

first_batch_results <- read_csv("~/ihw/tableAnnotator/annotations/first/first_batch_results.csv")
first_batch_results <- first_batch_results %>% rename(corrupted_text = corrupted) %>% mutate(corrupted_text = ifelse(corrupted_text, "Corrupted older annotation", NA))

second_batch_results <- read_csv("~/ihw/tableAnnotator/annotations/second/second_annotations.csv")
third_batch_results <- read_csv("~/ihw/tableAnnotator/annotations/third/third_batch_results.csv")

# fourth_batch_results <- read_csv("~/ihw/tableAnnotator/annotations/fourth_DEV/fourth_batch_results.csv")
# fourth_batch_results %>% filter (user != "undefined")

first_batch_results %>% distinct(user)
second_batch_results %>% distinct(user)
third_batch_results %>% distinct(user)


first_batch_results <- first_batch_results %>% mutate (docid = sapply(strsplit(docid, " &"), "[", 1))  %>% filter (! (user %in% c("undefined", "Demo", "Demodemo","testing"))) 

second_batch_results <- second_batch_results %>% mutate (docid = sapply(strsplit(docid, " &"), "[", 1))  %>% filter (! (user %in% c("undefined", "Demo", "Demodemo","testing"))) 

third_batch_results <- third_batch_results %>% mutate (docid = sapply(strsplit(docid, " &"), "[", 1))  %>% filter (! (user %in% c("undefined", "Demo", "Demodemo","testing"))) 


first_batch_results <- first_batch_results %>% mutate( comb = paste0(docid,"_",page))
second_batch_results <- second_batch_results %>% mutate( comb = paste0(docid,"_",page))
third_batch_results <- third_batch_results %>% mutate( comb = paste0(docid,"_",page))
# fourth_batch_results <- fourth_batch_results %>% mutate( comb = paste0(docid,"_",page))


first_batch_results %>% distinct(comb) %>% nrow
second_batch_results %>% distinct(comb) %>% nrow
third_batch_results %>% distinct(comb) %>% nrow


(first_batch_results %>% distinct(comb) %>% nrow) + (second_batch_results %>% distinct(comb) %>% nrow) + (third_batch_results %>% distinct(comb) %>% nrow)

first_only <- first_batch_results %>% filter (!(comb %in% second_batch_results$comb) ) %>% filter (!(comb %in% third_batch_results$comb) )
second_only <- second_batch_results %>% filter (!(comb %in% third_batch_results$comb) )
third_only <- third_batch_results 

first_only %>% distinct(comb) %>% nrow

second_only %>% distinct(comb) %>% nrow

third_only %>% distinct(comb) %>% nrow


allAnnotations <- first_only %>% rbind(second_only) %>% rbind(third_only) %>% filter (! (user %in% c("undefined", "Demo", "Demodemo","testing"))) %>% select(-comb)

allAnnotations %>% mutate( pmid_tbl=paste0(docid,"_",page)) %>% distinct(pmid_tbl) %>% nrow 

write_csv2(allAnnotations,"~/ihw/tableAnnotator/tools/all_annotations_OCT_2019.csv")


#allAnnotations <- first_only %>% rbind(second_only) %>% rbind(third_only) %>% rbind(fourth_batch_results) %>% filter (! (user %in% c("undefined", "Demo", "Demodemo","testing")))

### retrieve files missing from the new_obj, 
missingTables <- allAnnotations %>% distinct(comb) %>% anti_join( new_obj %>% select(pmid,tbl_n) %>% mutate( comb = paste0(pmid,"_",tbl_n))  ) %>% mutate( comb = paste0(comb,".html"))

htmlFiles <- list.files("/home/suso/ihw/tableAnnotator/tools/XLSExtract/htmlFiles")

htmlFiles[htmlFiles %in% missingTables$comb] 

paste0("/home/suso/ihw/tableAnnotator/tools/XLSExtract/htmlFiles/",missingTables$comb[missingTables$comb %in% htmlFiles]) %>% file.copy("/home/suso/ihw/tableAnnotator/olderTables")


