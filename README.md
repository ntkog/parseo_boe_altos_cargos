# Descarga Información Altos Cargos publicada en el boe

# Prerequisitos

- [pup](https://github.com/ericchiang/pup)
- [poppler](https://poppler.freedesktop.org/)
- awk, curl, grep
- nodejs


# Descarga y parseo de datos

Puedes ver el proceso en [este asciicinema](https://asciinema.org/a/IUC3MNxK7eUgIMDihvlgyrISc)

> Puedes copiar los comandos directamente del "vídeo"


# Pasos

```bash
git clone
npm i
cd data
curl -sS  "https://www.boe.es/boe/dias/2018/09/29/pdfs/BOE-A-2018-13218.pdf" | pdftotext -htmlmeta -layout - - | pup 'pre text{}' | awk '/DA
TOS PERSONALES/{n++}{print > "tabla" n ".txt"}'
ls -1 > ../listado.txt
cd ..
for i in `cat data/listado.txt`; do node index.js $i ; done | grep failed > failed_log.txt
```

> Al ejecutar este script se crearán ficheros *.json* de cada alto cargo en la carpeta *parsed*

> *NOTA 1* en el fichero *failed_log.txt* , verás que han fallado 3 ficeheros. Posiblemente porque los datos de algún alto cargo pillarán entre una página y otra (Sólo han fallado 3 de 1400 y pico)

> *NOTA 2* es posible que todavía no este fino el estructurado de datos , pero menos da una piedra de pdf, :-)
