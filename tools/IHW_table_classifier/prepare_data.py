import re, string
import pandas as pd

pattern = re.compile('[^A-z]+')
number_pattern = re.compile('[0-9]+')
symbol_pattern = re.compile(r'([^A-z0-9 ])')
multiple_ws_pattern = re.compile(' +')


# sim = symbol_pattern.sub(" \\1 ","abciximab (n=nmbr)")

# sim = multiple_ws_pattern.sub(" ",sim)

# sim

# re.sub(
#     pattern=r'(\d)(\w+)', 
#     repl='word: \\2, digit: \\1', 
#     string='1asdf'
# )


# pattern.sub(' ', '5151 mg/dl LDL cholesterol ||')

descriptors = []
terms = []

with open("data/subgroup_data_clean.csv", "r") as ins:
    
    for line in ins:
        line = line.replace("NA;","")
        elements = line.split("\";\"")
        
        descriptor = elements[0].split(".")[1]

        while descriptor.rfind('_') == (len(descriptor)-1):
            descriptor = descriptor[0:len(descriptor)-1] 

        descriptors.append(descriptor) 
        
        clean_terms = []
        for i in elements[1:len(elements)]:
            new_term = i
            new_term = number_pattern.sub("nmbr",new_term)  # This one changes numbers by the string "nmbr" to preserve information such as number ranges. (age ranges, etc)
            # new_term = pattern.sub(' ', new_term).lower().strip()
            new_term = symbol_pattern.sub(" \\1 ",new_term)
            new_term = multiple_ws_pattern.sub(" ",new_term)
            new_term = new_term.lower().strip()

            if len(new_term) > 0:
                clean_terms.append(new_term)
        terms.append(list(set(clean_terms)))
        


fullData = {'descriptor': descriptors, 'terms': terms}
fullData = pd.DataFrame(data=fullData)