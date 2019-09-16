library(readr)
library(tidyverse)

cons <- read_delim("concepts.csv", ";", escape_double = FALSE, trim_ws = TRUE)

cons <- cons %>% mutate( cleaned = str_to_lower(str_trim( gsub(' +', ' ',gsub('[\\^\\[\\]\\(\\)]+', '', gsub('([^$A-z0-9 ])', ' ', gsub('\n', ' ', gsub('\r\n', ' ', concept))),perl=TRUE) ))))

cons %>% filter( str_detect(cleaned,'fp n '))

cons %>% View()

write_csv2(cons, "/home/suso/ihw/tableAnnotator/clustered_terms_matching_clean.csv"  )

# 
# write_csv2(all_terms_clean %>% select(terms) %>% distinct , "/home/suso/ihw/tableAnnotator/Server/CLUSTERS/all_terms_June_2019.csv"  )
# 
# 
