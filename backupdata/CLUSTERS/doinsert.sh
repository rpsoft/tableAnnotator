#!/bin/bash
sudo -u postgres psql -U postgres -d ihw_annotator -a -f insert.sql
