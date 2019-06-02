#!/bin/bash
for filename in *.html; do
	#./MyProgram.exe "$filename" "Logs/$(basename "$filename" .txt)_Log$i.txt"
	iconv -f UTF-16 -t UTF-8 "$filename" -o "utf8/$filename"
done
