# Flashing ESPHome (no Home Assistant)

Goal: firmware on the ESP32, Wi‑Fi up, **web UI** at `http://dust-collector.local` (or the board’s IP). Sensors can wait.

## 0. One-time computer setup

1. Install USB serial drivers if Windows/macOS does not see a new COM/cu.device when you plug in the DevKit (**CP210x** or **CH340**, depending on the board).
2. Use a **data** USB cable.
3. You will use [ESPHome web](https://web.esphome.io/) in Chrome/Edge (WebSerial). Firefox is unreliable for flashing.

No Home Assistant install. No MQTT broker. Optional later: ESPHome CLI via `pip install esphome` if you prefer the terminal.

## 1. Secrets file

```bash
cd smart-dust-collector/firmware
cp esphome/secrets.yaml.example esphome/secrets.yaml
```

Edit `esphome/secrets.yaml`:

```yaml
wifi_ssid: "YourShopWifi"
wifi_password: "your-password"
api_encryption_key: "SEE_BELOW"
ota_password: "pick-a-long-random-string"
fallback_ap_password: "at-least-8-chars"
```

Keys must match [`../firmware/esphome/secrets.yaml.example`](../firmware/esphome/secrets.yaml.example).

### API encryption key (without HA)

ESPHome expects a base64 key. Easiest options:

- In [web.esphome.io](https://web.esphome.io/), use **Prepare for first use** / wizard flows that generate a key, **or**
- Generate 32 random bytes and base64-encode them, e.g. on macOS/Linux:

```bash
openssl rand -base64 32
```

Paste that single line as `api_encryption_key`. You can ignore the native API afterward; control does not use it. It is only there so OTA / future tools have a credential.

**Do not commit** `secrets.yaml` (it is gitignored).

## 2. First flash (empty board)

1. Hold **BOOT** on the DevKit if your board needs it (many D1-mini-style ESP32 boards: hold BOOT, tap EN/RESET, release BOOT when the flasher connects).
2. Open [web.esphome.io](https://web.esphome.io/) → connect the serial port.
3. Install a minimal ESPHome image **or** compile this repo’s YAML:

**Option A — Web: adopt then paste config**  
Some builders flash “first use,” join Wi‑Fi, then use **Install** → **Manual download** from a machine with ESPHome CLI.

**Option B — CLI (recommended once comfortable)**

```bash
# from smart-dust-collector/firmware
pip install esphome          # once
esphome run esphome/dust-collector.yaml
```

Pick the serial port when prompted. First compile downloads toolchains (can take several minutes).

## 3. Wi‑Fi and captive portal

If the board cannot join Wi‑Fi, it raises a fallback AP named like **Dust Collector Fallback**. Join it, open the captive portal, and set credentials—or fix `secrets.yaml` and reflash.

## 4. Open the local web UI

On a phone/laptop on the same LAN:

- Try `http://dust-collector.local`  
- Or find the IP in your router’s DHCP list  

You should see ESPHome’s web server with entities such as relay switch, gate percent, CT binary sensor, and state text.

**Done when:** web UI loads and the relay switch toggles (even with nothing wired yet—the GPIO will just change level).

## 5. Logs

- USB: `esphome logs esphome/dust-collector.yaml`  
- Or WebSerial from web.esphome.io  

Watch for boot, Wi‑Fi connected, and no brown-out resets when you later attach the servo power supply.

## 6. Common flash failures

| Symptom | Fix |
| ------- | --- |
| No serial port | Driver, data cable, try another port; hold BOOT |
| `Wrong boot mode` | Hold BOOT during connect |
| Wi‑Fi connect fail | 2.4 GHz SSID (ESP32 has no 5 GHz); check password |
| Brown-out / reboot when servo moves | Servo must use **separate 5 V** supply; common GND |
| `.local` does not resolve | Use IP address; some guest networks block mDNS |

## 7. What the stock YAML already does

Once sensors/actuators are wired ([breadboard.md](breadboard.md)):

1. CT (or temporary button hack) → tool on  
2. Open blast gate servo  
3. Turn relay GPIO on  
4. Tool off → wait `purge_seconds` → relay off → gate closed  

No hub in that path. Details: [architecture.md](architecture.md).

Next: [Breadboard build](breadboard.md).
