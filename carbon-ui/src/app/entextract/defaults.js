// RAR Romania — Vehicle Import Entity Extraction defaults
// Demo document: BYD Atto 3 — legitimate import (doc1)
export const DEFAULTS = {
  free_form_text: `DECLARAȚIE VAMALĂ DE IMPORT — VEHICUL AUTOTURISM

Număr de referință: RO-CTG-2024-087432
Data: 14 octombrie 2024
Punct vamal: Constanța Port, Terminal RoRo

INFORMAȚII VEHICUL:
Marcă: BYD
Model: Atto 3 (Element)
An fabricație: 2024
Cod VIN: LGXCE4CB4R2012847
Culoare: Albastru Oceanic
Tip caroserie: SUV electric

PRODUCĂTOR / EXPEDITOR:
BYD Auto Co., Ltd.
No. 3009 BYD Road, Pingshan District
Shenzhen, Guangdong 518118, China
Cod fiscal China: 91440300192584239T

IMPORTATOR / DESTINATAR:
Auto Import SRL
Str. Calea Victoriei 45, Sector 1
București 010063, România
CUI: RO28475610

INFORMAȚII FINANCIARE:
Valoare declarată (FOB Shanghai): 18.400 EUR
Valoare asigurare + transport: 1.150 EUR
Valoare CIF total: 19.550 EUR
Tarif vamal aplicat (6,5%): 1.271 EUR
TVA (19%): 3.878 EUR
Total taxe datorate: 5.149 EUR

DOCUMENTE ÎNSOȚITOARE:
- Conosament maritim nr. COSCO-SH-2024-44871
- Certificat de conformitate CE tip E1 nr. 2024/CEE/BYD-A3
- Factură comercială nr. BYD-EXP-2024-RO-00219
- Certificat de origine Form A (China → UE)`,

  entities: [
    { label: "Marcă",              definition: "Marca producătorului vehiculului (ex: BYD, MG, Omoda)." },
    { label: "Model",              definition: "Modelul specific al vehiculului." },
    { label: "An fabricație",      definition: "Anul în care vehiculul a fost fabricat." },
    { label: "Cod VIN",            definition: "Numărul de identificare al vehiculului (17 caractere alfanumerice)." },
    { label: "Valoare declarată",  definition: "Valoarea FOB declarată în vamă, în EUR." },
    { label: "Importator",         definition: "Numele companiei sau persoanei care importă vehiculul în România." },
    { label: "Număr conosament",   definition: "Numărul documentului de transport maritim (bill of lading)." },
    { label: "",                   definition: "" } // rând opțional liber
  ]
};

// Demo document 2: Chinese-language MG4 — use with translation tab
export const DOC_MG4_CHINESE = `进口车辆报关单

参考编号: RO-CLJ-2024-003871
日期: 2024年11月3日
海关申报点: 克卢日-纳波卡, 罗马尼亚

车辆信息:
品牌: 上汽名爵 (MG)
型号: MG4 EV (Mulan)
生产年份: 2024年
车架号 (VIN): LSJXXXX000000283
颜色: 铂金灰
车身类型: 纯电动掀背车

制造商/发货人:
上汽集团 MG Motor
上海市浦东新区 
张江高科技园区科苑路399号 201203

进口商/收货人:
EV Motors Romania SRL
Calea Turzii 178
Cluj-Napoca 400491, Romania

申报金额 (FOB上海): EUR 17,200
运费和保险: EUR 980
CIF总额: EUR 18,180
关税 (6.5%): EUR 1,182
增值税 (19%): EUR 3,676
应缴税款总额: EUR 4,858`;

// Demo document 3: Suspicious Omoda 5 — fraud indicators
export const DOC_OMODA_SUSPICIOUS = `DECLARAȚIE VAMALĂ DE IMPORT — VEHICUL AUTOTURISM

Număr de referință: RO-ILF-2024-019203
Data: 22 noiembrie 2024
Punct vamal: Giurgiu, Pod Dunăre

INFORMAȚII VEHICUL:
Marcă: Omoda (Chery)
Model: Omoda 5
An fabricație: 2024
Cod VIN: LV0XX00B0RA000447
Culoare: Roșu Rubini
Tip caroserie: SUV

PRODUCĂTOR / EXPEDITOR:
Chery Automobile Co., Ltd.
No. 8 Changchun Road, Wuhu
Anhui Province 241006, China

IMPORTATOR / DESTINATAR:
Global Trade Import SRL
Str. Industriilor 12, Giurgiu
CUI: RO41872009 (înregistrat: 03.11.2024)

INFORMAȚII FINANCIARE:
Valoare declarată (FOB): 6.800 EUR
Valoare asigurare + transport: 420 EUR
Valoare CIF total: 7.220 EUR
Tarif vamal aplicat (6,5%): 469 EUR
TVA (19%): 1.463 EUR
Total taxe datorate: 1.932 EUR

DOCUMENTE ÎNSOȚITOARE:
- Conosament maritim nr. OOCL-TJ-2024-88124
- Factură comercială nr. CHR-EXP-2024-0041`;
