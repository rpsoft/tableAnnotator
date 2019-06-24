library(tidyverse)


## Read in data ----
ft <- readRDS("Outputs/Full_set_of_tables.Rds")
ft_df <- readRDS("Outputs/tbl_fig_titles_size.Rds")

arm <- read_csv("Data/Avi_original/arm.csv", col_types = cols(.default = col_character()))
strat <- read_csv("Data/Avi_original/strat.csv", col_types = cols(.default = col_character()))
trial <- read_csv("Data/Avi_original/trial.csv", col_types = cols(.default = col_character()))
trial <- trial %>% 
  rename(result = Pinteraction)


## ----
ft2 <- ft %>% 
  inner_join(ft_df %>% 
              filter(extracted %in% 
                       c("extracted", "canonical", "partial_from_image", "fully_from_image")) %>% 
              distinct(pmid, extracted))

ft2_off <- ft %>% 
  anti_join(ft2 %>% select(search_round:col, file_name, original_file_stored, pmid))

## Drop rows 1 and 2 ----
ft3 <- ft2 %>%
  filter(row >=4, !is.na(character), !character == "") %>%
  mutate(txt = str_trim(character)) %>% 
  distinct(txt)
ft3_char <- ft3 %>% 
  mutate(txtn2 = str_replace(txt %>% str_to_lower(), "(\\b|[0-9])to(\\b|[0-9])", ""),
        txt_count = str_count(txtn2, "[a-z]"),
        lngth = str_length(txtn2)) %>% 
  filter(txt_count >=2 | txt_count == lngth) %>% 
  arrange(txt)

ft4 <- ft3_char %>% 
  distinct(txt)

## Add on canonical text fields
arm2 <- arm %>% 
  select(comparison, outcome, variable, value, arm, measure, arm_descriptor) %>% 
  gather(key = "var", "txt") %>% 
  distinct(txt)
strat2 <- strat %>% 
  select(comparison, outcome, variable, value, measure) %>% 
  gather(key = "var", "txt") %>% 
  distinct(txt)
trial2 <- trial %>% 
  select(comparison, outcome, variable) %>% 
  gather(key = "var", "txt") %>% 
  distinct(txt)
canonical <- bind_rows(arm2,
                       strat2,
                       trial2) %>% 
  mutate(txt = str_trim(txt)) %>% 
  filter(!is.na(txt), !txt == "") %>%
  distinct()


## add both together
final_strings <- bind_rows(ft4, canonical) %>% distinct(txt)
saveRDS(final_strings, "Outputs/all_non_numeric_strings.Rds")
