import json,sys,urllib.request
for f in sys.argv[1:]:
    d=json.load(open(f)); u=d['output']['image']['download_link']
    urllib.request.urlretrieve(u, f.replace('.out','.png')); print(f, 'ok')
