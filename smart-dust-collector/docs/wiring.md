# Wiring reference

Step-by-step breadboard instructions live in **[breadboard.md](breadboard.md)**. This page is the short pin/power cheat sheet.

## Low-voltage (ESP32)

| Function | GPIO | Notes |
| -------- | ---- | ----- |
| Gate 1 servo signal | 18 | Separate 5 V supply for servo power |
| SSR / relay drive | 26 | 3.3 V logic; transistor buffer recommended |
| CT ADC | 34 | Input-only; burden + mid-rail bias required |
| Airflow ADC (optional) | 35 | Input-only |
| Bring-up button (optional) | 23 | Commented block in firmware YAML |
| I²C SDA / SCL (optional ΔP) | 21 / 22 | |

```text
USB ──► ESP32 logic only
5 V ≥2 A adapter ──► servo (+)
Adapter GND ──► ESP32 GND   (required common ground)
```

## CT clamp

1. Clamp **one hot** conductor, not the whole cord.  
2. Fit the datasheet **burden** resistor.  
3. Bias the ADC node to ~1.65 V (see breadboard Phase C).  
4. Calibrate `tool_on_threshold` using **Tool Current Proxy** in the web UI.

## Mains / collector

```text
Mains hot ──► SSR/contactor ──► Collector hot
Mains neutral ──► Collector neutral (unsitched)
SSR DC input ──► ESP drive (GPIO26 path)
```

- Rate for locked-rotor / inrush, not just FLA.  
- Physical E‑stop independent of firmware.  
- Enclose and separate from LV.  
- Not electrical advice—use a licensed electrician if unsure.

## Related

- [getting-started.md](getting-started.md) — ordered phases  
- [shopping-list.md](shopping-list.md) — parts  
- [bring-up.md](bring-up.md) — pass/fail checklist  
