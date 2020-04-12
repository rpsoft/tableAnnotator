library(tidyverse)
library(readr)

setwd("~/ihw/tableAnnotator/metamap_api")

cui_def <- read_csv("cui_def.csv")

cui_concept <- read_csv("cui_concept.csv")

cuis_recommend <- read_csv("cuis_recommend.csv")

colnames(cui_concept) = c("concept","cuis")

maxCC <- max((cuis_recommend %>% filter (cc < 10000))$cc ) 

missing_recommends <- cui_concept %>% mutate( concept = str_squish(gsub("^", " ", fixed=TRUE, gsub("]", " ", fixed=TRUE, gsub("[", " ", fixed=TRUE, concept ))))) %>% filter(!is.na(concept)) %>% filter( ! (concept %in% cuis_recommend$concept) ) %>% 
  distinct() %>% filter(!is.na(cuis)) %>% mutate(rep_cuis = "NULL", excluded_cuis = "NULL", cc = maxCC +1 ) 

final_recommend <- cuis_recommend %>% rbind(missing_recommends) %>% arrange(cc)

final_recommend %>% View

write_csv2(final_recommend, "final_recommend.csv")

# cuis_recommend %>% colnames
