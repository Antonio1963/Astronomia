"""Calcola l'impronta SHA-256 di un codice di sblocco, da incollare in CODICI_SBLOCCO (js/sblocco.js).

Uso: python3 strumenti/impronta_codice.py CODICE [CODICE ...]
Nel sito finisce solo l'impronta, non il codice: chi legge il sorgente non può ricavarlo.
"""
import hashlib
import sys

for codice in sys.argv[1:]:
    print(f'  "{hashlib.sha256(codice.strip().upper().encode()).hexdigest()}",')
