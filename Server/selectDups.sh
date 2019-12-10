#!/bin/bash




for f1 in HTML_TABLES/*
do
    #echo "Removing password for pdf file - $f1"

    for f2 in HTML_TABLES_V/*
    do
	#di=$(diff $f1 $f2)
	base1=$(basename $f1)
	base2=$(basename $f2)
	
	clean=$(echo $base2 | sed -e 's/v[0-9]//g')

	if [ "$base1" == "$clean" ]
	then
		echo "$base1 $clean"
		$(mv $f1 "HTML_TABLES_S/$base1")
	fi

	#echo "$di"
	#if [ "$di" == "" ] 
	#then
	#   
	#    echo "$base1 and $base2 are dups"
	#    $(mv $f2 "HTML_TABLES_DUPS/$base2")
	#fi

    done

done

#diff HTML_TABLES/30882239_2.html HTML_TABLES/30882239_2.html
