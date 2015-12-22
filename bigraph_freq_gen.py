import json

with open( "google-books-common-words.txt" ) as f:
    text = f.read()

bigrams = {}

lines = text.split( "\n" )
words = [l.split("\t") for l in lines]

print words[0]

for word in words:
    if len( word ) != 2:
        continue
    c = int(word[1])
    for i in range(len(word)-1):
        bg = word[0][i:i+2]
        if len(bg) != 2: continue
        if bg in bigrams:
            bigrams[bg] += c
        else:
            bigrams[bg] = c


max_count = 0
for bg in bigrams:
    if bigrams[bg] > max_count:
        max_count = bigrams[bg]

for bg in bigrams:
    bigrams[bg] = bigrams[bg] / float(max_count)

with open( "bigram_freq.json", 'w' ) as f:
     f.write( json.dumps( bigrams, indent=4 ) )
