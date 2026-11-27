"""Clips de las escenas con APIMart (wan2.6-i2v-flash, 720p, 0,0336 USD/s).

La llave se lee de APIMART_API_KEY. Con "audio" la persona mueve los labios con esa voz (lipsync);
sin audio sale mudo. Revisa el saldo antes y después y para si el gasto pasaría del tope.
Uso: python generar.py   (desde esta carpeta)
"""
import json, os, sys, time, urllib.request, uuid, mimetypes
BASE = "https://api.apimart.ai/v1"; TOPE_USD = 1.50; PRECIO_S = 0.0336
H = {"Authorization": "Bearer " + os.environ["APIMART_API_KEY"]}

def pedir(metodo, ruta, cuerpo=None, datos=None, tipo=None):
    req = urllib.request.Request(BASE + ruta, method=metodo, headers=dict(H))
    if cuerpo is not None:
        req.data = json.dumps(cuerpo).encode(); req.add_header("Content-Type", "application/json")
    elif datos is not None:
        req.data = datos; req.add_header("Content-Type", tipo)
    try:
        return json.loads(urllib.request.urlopen(req, timeout=180).read())
    except urllib.error.HTTPError as e:
        sys.exit(f"APIMart {e.code}: {e.read().decode(errors='replace')[:600]}")

def subir(ruta, clase):
    lim = uuid.uuid4().hex; nombre = os.path.basename(ruta)
    tipo = mimetypes.guess_type(nombre)[0] or "application/octet-stream"
    cuerpo = (f"--{lim}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"{nombre}\"\r\n"
              f"Content-Type: {tipo}\r\n\r\n").encode() + open(ruta, "rb").read() + f"\r\n--{lim}--\r\n".encode()
    return pedir("POST", f"/uploads/{clase}", datos=cuerpo, tipo=f"multipart/form-data; boundary={lim}")["url"]

def saldo():
    return pedir("GET", "/user/balance")["remain_balance"]

def tid(r):
    d = r.get("data", r); d = d[0] if isinstance(d, list) else d
    return d.get("task_id") or d.get("id")

lote = json.load(open("lote.json", encoding="utf-8"))
pend = [x for x in lote if not os.path.exists(x["salida"])]
estimado = sum(PRECIO_S * x["segundos"] for x in pend)
antes = saldo(); print(f"Saldo antes: {antes:.4f} USD · estimado {estimado:.3f} USD por {len(pend)} clips")
if estimado > TOPE_USD: sys.exit("El estimado pasa del tope; no se manda nada.")
tareas = {}
for x in pend:
    c = {"model": "wan2.6-i2v-flash", "prompt": x["prompt"], "image_urls": [subir(x["imagen"], "images")],
         "resolution": "720p", "duration": x["segundos"]}
    if x.get("audio"): c["audio_url"] = subir(x["audio"], "audios")
    else: c["audio"] = False
    tareas[x["salida"]] = tid(pedir("POST", "/videos/generations", c)); print("enviada", x["salida"])
costos = {}
for sal, t in tareas.items():
    t0 = time.time()
    while True:
        d = pedir("GET", f"/tasks/{t}"); d = d.get("data", d)
        if d.get("status") in ("completed", "success"): break
        if d.get("status") in ("failed", "cancelled"): print("FALLÓ", sal, d.get("error")); d = None; break
        if time.time() - t0 > 1500: print("tardó demasiado", sal, t); d = None; break
        time.sleep(12)
    if not d: continue
    vids = (d.get("result") or {}).get("videos") or []
    url = vids[0]["url"]; url = url[0] if isinstance(url, list) else url
    urllib.request.urlretrieve(url, sal); costos[sal] = d.get("cost"); print("ok", sal, d.get("cost"))
despues = saldo()
print(f"Saldo después: {despues:.4f} USD · gastado {antes - despues:.4f} USD")
json.dump({"saldo_antes": antes, "saldo_despues": despues, "costos": costos}, open("costos.json", "w"), indent=1)
