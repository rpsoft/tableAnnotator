#!/bin/bash




for f1 in HTML_TABLES_VERSIONS/*
do
    
base=$(basename $f1)
clean=$(echo $base | sed -e 's/v[0-9]//g')

$(mv $f1 "HTML_TABLES_VERSIONS/$clean")

done

#diff HTML_TABLES/30882239_2.html HTML_TABLES/30882239_2.html
