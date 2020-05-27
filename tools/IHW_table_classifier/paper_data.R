library(readr)
library(dplyr)
library(stringr)


prediction_data <- read_csv("ihw/tableAnnotator/Server/prediction_data.csv")

(prediction_data %>% filter(!str_detect(tolower(label), pattern = ";")))$label 

prediction_data$label %>% table

semtype_counts <- read_csv("ihw/tableAnnotator/Server/semtype_counts.csv")

semtype_counts %>% arrange(desc(count))

semtype_definitions <- read_delim("ihw/tableAnnotator/Server/semtype_definitions.csv", 
                                  "|", escape_double = FALSE, trim_ws = TRUE)

semtype_counts %>% inner_join(semtype_definitions) %>% arrange(desc(code)) 


prediction_data$is_empty_row %>% table
prediction_data$is_empty_row_p %>% table

prediction_data$is_bold %>% table
prediction_data$is_italic %>% table
prediction_data$is_indent %>% table
