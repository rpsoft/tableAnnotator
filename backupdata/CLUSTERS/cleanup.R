library(readr)
library(tidyverse)

allterms <- read_csv("ihw/tableAnnotator/Server/CLUSTERS/allterms.csv")
# allTerms %>% select(term) %>% rbind(all_non_numeric_strings)

allterms %>% colnames
colnames(allterms)[2] = "terms"

allterms %>% select(terms) %>% rbind(all_non_numeric_strings) -> all_terms

# write_csv2(all_terms, "/home/suso/ihw/tableAnnotator/Server/CLUSTERS/all_terms_June_2019.csv")

# testing <- all_non_numeric_strings %>%  filter(str_detect(tolower(terms), pattern = "\r\n"))

all_terms_clean <- all_terms %>% mutate( cleaned= str_to_lower(str_trim (gsub('[",;]', '',gsub('  ', ' ', gsub(' +', ' ', gsub('nmbr', ' $nmbr$ ', gsub('[0-9]+', 'nmbr', gsub('(\\^)', ' \\1 ', gsub('(\\])', ' \\1 ', gsub('(\\[)', ' \\1 ', gsub('([^A-z0-9 ])', ' \\1 ', gsub('--+', '--',  gsub('- -', '--',  gsub('\n', ' ', gsub('\r\n', ' ', terms)))) ))))))))))))

colnames(all_terms_clean) = c("old_terms","terms")
# 
# all_terms_clean %>% select(terms) %>% distinct
# 
# all_terms_clean %>%  filter(str_detect(tolower(terms), pattern = '\\^')) %>% mutate(terms = gsub('(\\^)', ' \\1 ', terms)) 


# write_csv2(test %>% select(terms) , "/home/suso/ihw/tableAnnotator/Server/CLUSTERS/all_terms_June_2019.csv")

write_csv2(all_terms_clean %>% select(terms) %>% distinct , "/home/suso/ihw/tableAnnotator/Server/CLUSTERS/all_terms_June_2019.csv"  )

# 
# str = 'Now is the time      '
#   ## spaces only
# 
# pattern = re.compile('[^A-z]+')
# number_pattern = re.compile('[0-9]+')
# symbol_pattern = re.compile(r'([^A-z0-9 ])')
# multiple_ws_pattern = re.compile(' +')
# 
# def cleanTerm (term):
#   term = number_pattern.sub("nmbr",term)  # This one changes numbers by the string "nmbr" to preserve information such as number ranges. (age ranges, etc)
# # term = pattern.sub(' ', term).lower().strip()
# term = symbol_pattern.sub(" \\1 ",term)
# term = multiple_ws_pattern.sub(" ",term)
# term = term.lower().strip()
# return term
# 


