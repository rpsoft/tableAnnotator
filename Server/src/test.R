needs(readr,tidyverse)
# 
write_rds(x = input, path = "/home/suso/ihw/tableAnnotator/Server/src/test.rds")
# 
input <- read_rds("/home/suso/ihw/tableAnnotator/Server/src/test.rds")
input


anns <- input[[1]]$annotation %>% as.data.frame()

anns <- anns %>% mutate( docid = input[[1]]$docid )
anns <- anns %>% mutate( page = input[[1]]$page )
anns <- anns %>% mutate( user = input[[1]]$user )
anns <- anns %>% mutate( corrupted = input[[1]]$corrupted )
anns <- anns %>% mutate( tableType = input[[1]]$tableType )

anns


anns <- anns %>% select(user,docid,page,corrupted,tableType,location,number,content,qualifiers) %>% 
  mutate(page = as.double(page)) %>% 
  mutate(corrupted = ifelse(corrupted == "false",FALSE,TRUE)) %>%
  mutate(qualifiers = ifelse( qualifiers == "",NA, qualifiers)) %>%
  mutate(content = ifelse( content == "",NA, content)) %>% 
  as.tibble()

annotations <- anns
