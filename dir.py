import os

def writeFolder(path):
    for entry in os.listdir(path):
        full_path = os.path.join(path, entry)
        if os.path.isdir(full_path):
            writeFolder(full_path)
        else:
            f.write('https://scratch.mit.edu/scratchr2/static' + full_path[24:].replace('\\', '/') + '\n')

f = open("wget.txt", "w")
f.write('# Usage: wget --no-check-certificate -i wget.txt -x\n')
f.write('# Takes about half an hour to download everything on HDD and a Linksys USB wireless adapter\n')
f.write('# May be faster on SSD with a better wireless card\n\n')
writeFolder('./heatherscratchr2static')
f.close()