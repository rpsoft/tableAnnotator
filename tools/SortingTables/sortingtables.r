library(tidyverse)


setwd("~/ihw/tableAnnotator/tools/SortingTables")

load("~/ihw/tableAnnotator/tools/SortingTables/trials_conditions_lookup_atc_code_lookup.Rdata")

eligible_nct_ids_pmids <- readRDS("~/ihw/tableAnnotator/tools/SortingTables/eligible_nct_ids_pmids.Rds")

mytable <- conditions_lkp %>% select(nct_id,mesh_broad_label) %>% left_join(eligible_nct_ids_pmids %>% filter(!is.na(pmid)))

mytable %>% View()
# 
# new_obj <- readRDS("~/ihw/tableAnnotator/tools/RDS_TO_HTML/new_obj.rds")
# new_obj %>% select(pmid_tbl) %>% separate(pmid_tbl, c("pmid", "table"), "_") %>% select(pmid) %>% distinct() -> study_pmids
# 
# tables_with_mesh_broad_labels <- mytable %>% filter( pmid %in% study_pmids$pmid )
# 
# tables_with_mesh_broad_labels %>% arrange(pmid) %>% View

write_csv2(mytable, "~/ihw/tableAnnotator/Server/pmid_msh_label.csv")
