library(readr)


local <- read_delim("~/ihw/tableAnnotator/DBmerger/local.csv", 
                    "|", quote = "'", escape_double = FALSE, 
                    trim_ws = TRUE)

remote <- read_delim("~/ihw/tableAnnotator/DBmerger/remote.csv", 
                     "|", quote = "'", escape_double = FALSE, 
                     trim_ws = TRUE)

## new annotations, not present in the previous copy
newkeys <- remote %>% mutate(docid = docidd) %>% select(-docidd) %>% mutate(key = paste0(docid,"_",page)) %>% filter( ! (key %in% (local %>% mutate(key = paste0(docid,"_",page)))$key) ) %>% select(key)

newAnnotations <- remote %>% mutate(docid = docidd) %>% select(-docidd) %>% mutate(key = paste0(docid,"_",page)) %>% filter( key %in% newkeys$key ) %>% select(-key)

missing_new <- annres %>% mutate(key = paste0(docid,"_",page)) %>% filter( key %in% newkeys$key ) 

write_csv2(missing_new, "~/ihw/tableAnnotator/DBmerger/missing_new.csv")


missing_new %>% distinct(key)
