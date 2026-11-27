"""Genera la voz de los anuncios con ElevenLabs (con tiempos por carácter para subtítulos).

La llave se lee de ELEVENLABS_API_KEY (nunca en archivos).
Uso: python voz.py <voice_id> <modelo> <salida_sin_extension> "texto"
Deja <salida>.mp3 y <salida>.json (alineación: caracteres con inicio y fin en segundos).
"""
import base64, json, os, sys, urllib.request

voz, modelo, salida, texto = sys.argv[1:5]
cuerpo = {"text": texto, "model_id": modelo,
          "voice_settings": {"stability": 0.5, "similarity_boost": 0.8, "style": 0.3, "use_speaker_boost": True}}
if modelo in ("eleven_v3", "eleven_v4"):
    cuerpo["voice_settings"] = {"stability": 0.5}
req = urllib.request.Request(
    f"https://api.elevenlabs.io/v1/text-to-speech/{voz}/with-timestamps?output_format=mp3_44100_128",
    data=json.dumps(cuerpo).encode(), method="POST",
    headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json"})
try:
    r = json.loads(urllib.request.urlopen(req, timeout=120).read())
except urllib.error.HTTPError as e:
    sys.exit(f"ElevenLabs {e.code}: {e.read().decode(errors='replace')[:500]}")
open(salida + ".mp3", "wb").write(base64.b64decode(r["audio_base64"]))
al = r.get("normalized_alignment") or r.get("alignment")
json.dump({"texto": texto, "voz": voz, "modelo": modelo, "alineacion": al}, open(salida + ".json", "w", encoding="utf-8"), ensure_ascii=False)
print(salida + ".mp3", round(al["character_end_times_seconds"][-1], 2), "s")
