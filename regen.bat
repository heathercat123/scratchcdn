@echo off
del .wget-hsts
del wget.txt
rd /s /q scratch.mit.edu
py dir.py
get
