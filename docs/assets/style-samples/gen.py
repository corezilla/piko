#!/usr/bin/env python3
import math, html
W,H=1380,860
P=[]
def add(s): P.append(s)
def tx(x,y,s,size=13,w="400",fill="#111827",anchor="start",ls=0):
    add(f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{w}" fill="{fill}" text-anchor="{anchor}" letter-spacing="{ls}">{html.escape(s)}</text>')
def rr(x,y,w,h,r,fill="none",stroke="none",sw=0,extra=""):
    add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" {extra}/>')
def grad(id,c1,c2,x2=0,y2=1):
    add(f'<linearGradient id="{id}" x1="0" y1="0" x2="{x2}" y2="{y2}"><stop offset="0" stop-color="{c1}"/><stop offset="1" stop-color="{c2}"/></linearGradient>')
def arrow(x1,y1,x2,y2,color,w=2,dash=""):
    a=math.atan2(y2-y1,x2-x1); L=12; Wd=5.2
    bx,by=x2-L*math.cos(a),y2-L*math.sin(a)
    add(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{bx:.1f}" y2="{by:.1f}" stroke="{color}" stroke-width="{w}" {("stroke-dasharray="+dash) if dash else ""} stroke-linecap="round"/>')
    p1=f"{x2:.1f},{y2:.1f}"
    p2=f"{bx+Wd*math.sin(a):.1f},{by-Wd*math.cos(a):.1f}"
    p3=f"{bx-Wd*math.sin(a):.1f},{by+Wd*math.cos(a):.1f}"
    add(f'<polygon points="{p1} {p2} {p3}" fill="{color}"/>')
def label(x,y,s,color="#111827",fs=12.5):
    wpx=len(s)*fs*0.62+16
    rr(x-wpx/2,y-15,wpx,22,7,fill="#F7F8FB")  # chip bg to cover lines
    tx(x,y, s, fs,"800",color,"middle")
def icon(name,cx,cy,s,color="#fff",sw=2):
    g=f'<g transform="translate({cx},{cy})" fill="none" stroke="{color}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">'
    add(g); k=s/24
    def P_(d): add(f'<path d="{d}"/>')
    if name=="send": P_("M-9,-8 L10,0 L-9,8 L-5,0 Z")
    elif name=="check": add(f'<circle r="9"/>'); P_("M-4,0 L-1,3 L5,-4")
    elif name=="database": add(f'<ellipse cx="0" cy="-6" rx="8" ry="3.6"/>'); P_("M-8,-6 L-8,6 A8,3.6 0 0 0 8,6 L8,-6"); P_("M-8,0 A8,3.6 0 0 0 8,0")
    elif name=="cpu": add(f'<rect x="-8" y="-8" width="16" height="16" rx="3"/>'); add(f'<rect x="-2.5" y="-2.5" width="5" height="5" rx="1"/>'); P_("M-8,-3 L-11,-3 M-8,3 L-11,3 M8,-3 L11,-3 M8,3 L11,3 M-3,-8 L-3,-11 M3,-8 L3,-11 M-3,8 L-3,11 M3,8 L3,11")
    elif name=="cloud": P_("M-8,5 A5,5 0 0 1 -7,-5 A7,7 0 0 1 6,-5 A4.5,4.5 0 0 1 7,5 Z")
    elif name=="chat": add(f'<rect x="-9" y="-7" width="18" height="13" rx="3.5"/>'); P_("M-3,6 L0,10 L3,6")
    elif name=="folder": P_("M-9,-6 L-2,-6 L0,-3 L9,-3 L9,6 A2,2 0 0 1 7,8 L-7,8 A2,2 0 0 1 -9,6 Z")
    add('</g>')

add(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="-apple-system,\'PingFang SC\',\'Helvetica Neue\',Arial,sans-serif">')
add('<defs>')
grad("gBlue","#5B9BFF","#2563EB"); grad("gViolet","#A78BFA","#7C3AED"); grad("gGreen","#4ADE80","#16A34A")
grad("gIndigo","#818CF8","#4338CA"); grad("gSky","#38BDF8","#2563EB"); grad("gGray","#94A3B8","#64748B")
grad("metal","#FDFEFF","#DBE1EA"); grad("hi","#FFFFFF","#FFFFFF")
add('<linearGradient id="hi2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>')
add('<filter id="sh" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="7" stdDeviation="11" flood-color="#0F172A" flood-opacity="0.10"/></filter>')
add('<filter id="shs" x="-40%" y="-40%" width="180%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="7" flood-color="#0F172A" flood-opacity="0.16"/></filter>')
add('</defs>')
rr(0,0,W,H,0,fill="#F6F7FB")

# Title
tx(48,58,"Piko 运行环境 / 部署拓扑",27,"800","#0B1220")
tx(48,88,"Slinky → 多台 Piko → LLMTier；回程 Piko → Slinky",13,"400","#6B7280")

# Legend
lx=1030
for i,(c,t) in enumerate([("#EAF1FB","业务方"),("#EDF0FD","主机（Piko）"),("#F1F4FF","外部服务")]):
    x=lx+i*155
    rr(x,44,22,14,4,fill=c,stroke="#CBD5E1",sw=1)
    tx(x+30,56,t,12.5,"600","#374151")

# Slinky card
rr(48,250,300,336,24,fill="#ffffff",stroke="#E6EAF1",sw=1,extra='filter="url(#sh)"')
tx(76,296,"Slinky 主机",17,"800")
tx(76,320,"业务流程方 · 持有工作区",12,"400","#6B7280")
tiles=[("gBlue","send","请求"),("gViolet","check","结果"),("gGreen","database","数据")]
for i,(g,ic,lb) in enumerate(tiles):
    x=76+i*86
    rr(x,342,66,66,18,fill=f"url(#{g})",extra='filter="url(#shs)"')
    icon(ic,x+33,360,26); tx(x+33,396,lb,11.5,"800","#ffffff","middle")
rr(76,452,244,52,14,fill="#E8F6EE",stroke="#8FD3A9",sw=1.5)
icon("folder",100,478,22,"#166534",2); tx(122,483,"工作区存储（持久化归 Slinky）",11.5,"700","#166534")

# Matrix card
rr(470,36,346,98,20,fill="#ffffff",stroke="#E6EAF1",sw=1,extra='filter="url(#sh)"')
rr(492,58,56,56,15,fill="url(#gGray)",extra='filter="url(#shs)"')
icon("chat",520,86,26)
tx(564,80,"Matrix homeserver",16,"800"); tx(564,102,"discussion intake / sync",11.5,"400","#6B7280")

# Machines
def machine(x,y,title):
    rr(x,y,404,232,26,fill="url(#metal)",stroke="#B9C3D0",sw=1,extra='filter="url(#sh)"')
    add(f'<rect x="{x+18}" y="{y+10}" width="{404-36}" height="14" rx="9" fill="url(#hi2)"/>')
    # front panel strip + vents + led + port
    rr(x+18,y+186,404-36,32,10,fill="#EEF1F6",stroke="#D2D9E3",sw=1)
    for i in range(9):
        add(f'<rect x="{x+34+i*10}" y="{y+196}" width="5" height="12" rx="2.5" fill="#C4CDD9"/>')
    add(f'<circle cx="{x+404-46}" cy="{y+202}" r="5.5" fill="#22C55E"/>')
    rr(x+404-84,y+194,26,16,5,fill="none",stroke="#AEB9C7",sw="1.5")
    rr(x+28,y+34,74,74,18,fill="url(#gIndigo)",extra='filter="url(#shs)"')
    icon("cpu",x+65,y+71,30); tx(x+65,y+100,"Piko",11.5,"800","#ffffff","middle")
    tx(x+118,y+62,title,17,"800")
    rr(x+118,y+74,206,22,11,fill="#E3E8FF"); tx(x+130,y+90,"独立主机 · 独立 Task Store",10.5,"800","#3730A3")
    rr(x+28,y+124,348,52,12,fill="#FEF7D6",stroke="#E7C64A",sw=1.2)
    tx(x+44,y+146,"本地可靠 FS：Task Store（SQLite WAL） · Pi session（JSONL）",10.5,"400","#8A6D1B")
    tx(x+44,y+166,"staging（临时产物） · Pi SDK（进程内）",10.5,"400","#8A6D1B")
machine(560,150,"Piko 实例 1")
machine(560,470,"Piko 实例 2..N")
tx(560,406,"机器 A",13.5,"800"); tx(560,726,"机器 B .. N",13.5,"800")

# LLMTier
rr(1044,320,288,214,22,fill="#F1F4FF",stroke="#CBD5F5",sw=1,extra='filter="url(#sh)"')
rr(1068,344,66,66,18,fill="url(#gSky)",extra='filter="url(#shs)"')
icon("cloud",1101,377,28)
tx(1152,374,"LLMTier 主机",17,"800"); tx(1152,396,"唯一模型路径",12,"400","#6B7280")
tx(1068,438,"OpenAI-compatible",11.5,"400","#3730A3"); tx(1068,460,"Responses SSE",11.5,"400","#3730A3")
tx(1068,486,"stream:true · store:false",11.5,"400","#B91C1C"); tx(1068,508,"maxRetries=0",11.5,"400","#B91C1C")

# Flows
BL="#2E6BE6"; VI="#7C3AED"; GR="#16A34A"; GY="#98A2B3"
arrow(348,344,560,232,BL); arrow(348,360,560,552,BL)          # ① 请求
arrow(560,286,348,438,VI); arrow(560,606,348,454,VI)          # ③ 结果回程
arrow(348,492,560,648,GR)                                     # ④ 数据/工作区
arrow(964,232,1044,392,BL); arrow(964,552,1044,436,BL)        # ② SSE
arrow(560,134,250,250,GY,1.8); arrow(620,134,700,150,GY,1.8); arrow(500,134,560,556,GY,1.8)  # ⑤ discussion
label(432,300,"① 请求（提交 / 取消）",BL)
label(440,398,"③ 结果回程（状态 / Result JSON）",VI)
label(430,476,"④ 数据 / WorkspaceBinding",GR)
label(1002,318,"② SSE",BL)
label(714,112,"⑤ discussion",GY)
add('</svg>')
open("deploy.svg","w").write("\n".join(P))
print("written deploy.svg")
