library(tidyverse)
library(readr)
library(dplyr)

setwd("~/ihw/tableAnnotator/tools/SortingTables")

load("~/ihw/tableAnnotator/tools/SortingTables/trials_conditions_lookup_atc_code_lookup.Rdata")

eligible_nct_ids_pmids <- readRDS("~/ihw/tableAnnotator/tools/SortingTables/eligible_nct_ids_pmids.Rds")

mytable <- conditions_lkp %>% select(nct_id,mesh_broad_label) %>% left_join(eligible_nct_ids_pmids %>% filter(!is.na(pmid)))

# mytable %>% View()
# 
# new_obj <- readRDS("~/ihw/tableAnnotator/tools/RDS_TO_HTML/new_obj.rds")
# new_obj %>% select(pmid_tbl) %>% separate(pmid_tbl, c("pmid", "table"), "_") %>% select(pmid) %>% distinct() -> study_pmids
# 
# tables_with_mesh_broad_labels <- mytable %>% filter( pmid %in% study_pmids$pmid )
# 
# tables_with_mesh_broad_labels %>% arrange(pmid) %>% View

#

topic_groups <- mytable %>% select( -nct_id ) %>% distinct()
topic_groups %>% View

mytable <- mytable %>% select(-nct_id) %>% 
          filter(! is.na(pmid)) %>% distinct %>% 
          group_by(mesh_broad_label) %>% mutate(pmid = paste0(pmid, collapse = "&")) %>% 
          ungroup() %>% distinct()

#mytable <- mytable %>% select(-nct_id) %>% distinct %>% group_by(pmid) %>% mutate(mesh_broad_label = paste0(mesh_broad_label, collapse = "&"))  %>% ungroup() %>% distinct()

write_csv2(mytable, "pmid_msh_label.csv") # just to remember where this comes from.
write_csv2(mytable, "~/ihw/tableAnnotator/Server/pmid_msh_label.csv")

############### table counts by topic which are either tables with/out subgroup or unnassigned ( which I believe meant unnannotated )
annotated <- read_csv("annotated.csv")
colnames(annotated) = c("pmid","page","tableType")

annotated %>% inner_join(topic_groups) %>% select(tableType) %>% distinct

allfiles <- list.files("../../Server/HTML_TABLES") %>% as.data.frame()
colnames(allfiles) = c("filename")

all_docid_with_html <- allfiles %>% mutate ( filename =  str_replace(filename, ".html", "")) %>% mutate ( filename =  str_replace(filename, "v[0-9]", "")) %>% distinct()

colnames(all_docid_with_html) = c("docid")

files_n_annotations <- all_docid_with_html %>% left_join( annotated %>% inner_join(topic_groups) %>% mutate( docid = paste0(pmid,"_",page)) )

files_n_annotations %>% select(tableType) %>% distinct

topic_counts <- files_n_annotations %>% filter( ! tableType %in% c("baseline_table","other_table") ) %>% separate(docid, c("pmid", "page"), "_") %>% select(-mesh_broad_label) %>% left_join(topic_groups) %>% distinct %>% select(mesh_broad_label) %>% group_by(mesh_broad_label) %>% tally

write_csv2(topic_counts, "topic_counts.csv") 
###############################