# Wiring notes

## Low-voltage side (ESP32)

```text
ESP32 3V3 ──► SDP810 VDD (if used)
ESP32 GND ──► common GND (sensors + servo supply GND star)
GPIO21/22 ──► SDP810 SDA/SCL
GPIO34    ──► CT clamp divider / burden node
GPIO18    ──► Gate 1 servo signal
GPIO26    ──► SSR DC+ input (through resistor if required by module)
```

Servos need a **separate 5 V supply** sharing GND with the ESP32. Never pull multi-amp servo stalls from the ESP USB regulator.

## CT clamp

1. Clamp around **one** hot conductor of the tool circuit (not the whole cord).
2. Use the burden resistor specified for your SCT-013 variant.
3. Scale `sensor.tool_current_proxy` until idle vs running is clear; set the binary_sensor threshold.

## Mains / collector

```text
Mains Hot ──► SSR/contactor ──► Dust collector hot
Mains Neutral ──► Dust collector neutral (unswitched)
SSR DC control ◄── ESP GPIO26 (isolated)
```

- Prefer a contactor or industrial SSR rated above locked-rotor current.
- Enclose mains connections; use strain relief and correct wire gauge.
- Provide a physical emergency off independent of Wi-Fi/firmware.
- If unsure, hire a licensed electrician — this is not electrical advice.

## Anemometer jig

The upstream `BT-100 Anemometer Jig` holds a handheld anemometer for spot checks. For continuous telemetry, either log BT-100 readings during bring-up or add an SDP810 across the filter / pitot tap and map Pa → proxy CFM in ESPHome.

## Grounding & ESD

Shop dust can be conductive. Seal the ESP enclosure from chips, ferrite long servo runs, and earth-bond metal ducting per local code.
