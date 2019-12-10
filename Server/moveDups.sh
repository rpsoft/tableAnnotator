#!/bin/bash




for f1 in HTML_TABLES/*
do
    #echo "Removing password for pdf file - $f1"

    for f2 in HTML_TABLES_V/*
    do
	di=$(diff $f1 $f2)
	#echo "$di"

	if [ "$di" == "" ] 
	then
	   base1=$(basename $f1)
	   base2=$(basename $f2)
	    echo "$base1 and $base2 are dups"
	    $(mv $f2 "HTML_TABLES_DUPS/$base2")
	fi

    done

done

#diff HTML_TABLES/30882239_2.html HTML_TABLES/30882239_2.html
