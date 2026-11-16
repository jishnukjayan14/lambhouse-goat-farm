import json
import os

brain_dir = r"C:\Users\jishn\.gemini\antigravity\brain\99ef244a-91de-4753-a61c-0a5c5ea53fbe"
b64_file = os.path.join(brain_dir, "images_b64.json")

with open(b64_file, "r") as f:
    images = json.load(f)

logo_src = images["logo"]
qr_src = images["qr"]

html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>The Lamb House - Milk Invoice Design Suggestions</title>
  <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600;700;800&display=swap');
    
    body {{
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      margin: 0;
      padding: 24px;
    }}
    .a4-sheet {{
      width: 794px;
      min-height: 1123px;
      margin: 0 auto;
      background: #ffffff;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      border-radius: 8px;
      position: relative;
      color: #1f2937;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      box-sizing: border-box;
    }}
    .tab-btn.active {{
      background: #059669;
      color: #ffffff;
      border-color: #10b981;
      box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.39);
    }}
    .serif-title {{
      font-family: 'Playfair Display', Georgia, serif;
    }}
  </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen">

  <!-- Header Banner -->
  <div class="max-w-5xl mx-auto mb-6 text-center">
    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
      <span>📄 Single Page A4 • 3 Design Options</span>
    </div>
    <h1 class="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
      Milk Invoice Models (Full Page A4)
    </h1>
    <p class="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
      നിങ്ങൾക്ക് ഏറ്റവും ഇഷ്ടപ്പെട്ട ഡിസൈൻ ഏതാണെന്ന് മോഡൽ നമ്പർ (1, 2, അല്ലെങ്കിൽ 3) പറഞ്ഞുതന്നാൽ അത് ആപ്പിലെ ഫൈനൽ PDF ആയി സെറ്റ് ചെയ്യാം!
    </p>

    <!-- Model Selector Tabs -->
    <div class="flex flex-wrap justify-center gap-3 mt-6">
      <button onclick="selectModel(1)" id="tab-1" class="tab-btn active px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm font-bold transition-all flex items-center gap-2">
        <span class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">1</span>
        <span>Model 1: Emerald Executive (Modern Dark)</span>
      </button>
      <button onclick="selectModel(2)" id="tab-2" class="tab-btn px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm font-bold transition-all flex items-center gap-2">
        <span class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">2</span>
        <span>Model 2: Farmstead Heritage (Artisan Warm)</span>
      </button>
      <button onclick="selectModel(3)" id="tab-3" class="tab-btn px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm font-bold transition-all flex items-center gap-2">
        <span class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">3</span>
        <span>Model 3: Luxe Clean Slate (Minimalist White)</span>
      </button>
    </div>
  </div>

  <!-- Container for Sheets -->
  <div class="max-w-5xl mx-auto flex justify-center pb-16">

    <!-- ==================== MODEL 1: EMERALD EXECUTIVE ==================== -->
    <div id="model-1" class="model-view block">
      <div class="text-center mb-3">
        <span class="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-full">
          Model 1 • Modern Corporate Executive • Deep Emerald Header & Side-by-Side Dual Ledger
        </span>
      </div>

      <div class="a4-sheet p-8">
        <!-- Top Green Header -->
        <div>
          <div class="bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-900 rounded-2xl p-6 text-white shadow-md flex items-center justify-between">
            <div class="flex items-center gap-4">
              <img src="{logo_src}" alt="Logo" class="w-20 h-20 rounded-full border-2 border-emerald-300 shadow object-cover bg-white">
              <div>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-700/60 border border-emerald-500/30 text-emerald-200">
                  Daily Fresh Farm Goat Milk
                </span>
                <h1 class="text-2xl font-black tracking-tight mt-1">THE LAMB HOUSE</h1>
                <p class="text-xs text-emerald-100 font-medium">Goat Farm & Milk Supply • Mananthavady, Wayanad - 670645</p>
                <p class="text-[11px] text-emerald-200/90 mt-0.5 font-mono">Mob: 7306874214 / 9061237526</p>
              </div>
            </div>
            <div class="text-right">
              <span class="inline-block bg-white text-emerald-900 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg shadow-sm">
                MILK INVOICE
              </span>
              <p class="text-xs font-mono font-bold text-emerald-100 mt-2">#INV-MILK-2026-11-001</p>
              <p class="text-[11px] text-emerald-200 mt-0.5">Billing Month: <b>November 2026</b></p>
            </div>
          </div>

          <!-- Customer Info & Key Stat Badges -->
          <div class="mt-4 grid grid-cols-12 gap-4 items-stretch">
            <div class="col-span-7 bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Billed To (Customer Details):</span>
                <h3 class="text-base font-extrabold text-gray-900 mt-0.5">Muhammed Shafi</h3>
                <p class="text-xs text-gray-600">Thannikkal House, Payyampally, Mananthavady</p>
                <p class="text-xs text-gray-600 font-mono mt-0.5">Ph: +91 98471 23456</p>
              </div>
              <div class="mt-2 pt-2 border-t border-emerald-200/60 flex items-center gap-4 text-xs text-emerald-900">
                <span>Standard Rate: <b>₹30 / glass (200ml)</b></span>
                <span>•</span>
                <span>Regular Daily: <b>1 Glass</b></span>
              </div>
            </div>

            <div class="col-span-5 grid grid-cols-2 gap-2">
              <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center flex flex-col justify-center">
                <span class="text-[10px] font-bold text-gray-400 uppercase">Total Days</span>
                <span class="text-xl font-black text-gray-800 mt-0.5">30 Days</span>
                <span class="text-[10px] text-emerald-600 font-medium">Nov 1 – Nov 30</span>
              </div>
              <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center flex flex-col justify-center">
                <span class="text-[10px] font-bold text-gray-400 uppercase">Delivered</span>
                <span class="text-xl font-black text-emerald-700 mt-0.5">28 Days</span>
                <span class="text-[10px] text-gray-500 font-medium">2 Skips</span>
              </div>
              <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center flex flex-col justify-center">
                <span class="text-[10px] font-bold text-gray-400 uppercase">Total Milk</span>
                <span class="text-xl font-black text-gray-800 mt-0.5">28 Glasses</span>
                <span class="text-[10px] text-gray-500 font-medium">5.6 Litres</span>
              </div>
              <div class="bg-emerald-50 border border-emerald-300 rounded-xl p-3 text-center flex flex-col justify-center">
                <span class="text-[10px] font-bold text-emerald-800 uppercase">Amount Due</span>
                <span class="text-xl font-black text-emerald-900 mt-0.5">₹840</span>
                <span class="text-[10px] text-emerald-700 font-medium">Single Month</span>
              </div>
            </div>
          </div>

          <!-- Dual Column Daily Log Table (Full Page Height Proportion) -->
          <div class="mt-4">
            <div class="flex items-center justify-between mb-1.5 px-1">
              <span class="text-[11px] font-bold uppercase tracking-wider text-emerald-900">
                Daily Milk Delivery Ledger (Days 1–15 & 16–30)
              </span>
              <span class="text-[10px] text-gray-400">1 Glass = 200ml (₹30)</span>
            </div>

            <div class="grid grid-cols-2 gap-3 text-xs">
              <!-- Left Column: Days 1-15 -->
              <div class="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table class="w-full text-left">
                  <thead class="bg-emerald-800 text-white font-bold text-[10px] uppercase tracking-wider">
                    <tr>
                      <th class="py-1.5 px-3">Date</th>
                      <th class="py-1.5 px-2 text-center">Glasses</th>
                      <th class="py-1.5 px-2 text-right">Rate</th>
                      <th class="py-1.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100 text-[11px]">
                    <tr class="bg-white"><td class="py-1 px-3 font-medium">01 Nov (Sun)</td><td class="py-1 px-2 text-center font-bold text-emerald-800">1 gls</td><td class="py-1 px-2 text-right text-gray-400">30</td><td class="py-1 px-3 text-right font-semibold">₹30</td></tr>
                    <tr class="bg-gray-50/70"><td class="py-1 px-3 font-medium">02 Nov (Mon)</td><td class="py-1 px-2 text-center font-bold text-emerald-800">1 gls</td><td class="py-1 px-2 text-right text-gray-400">30</td><td class="py-1 px-3 text-right font-semibold">₹30</td></tr>
                    <tr class="bg-white"><td class="py-1 px-3 font-medium">03 Nov (Tue)</td><td class="py-1 px-2 text-center font-bold text-emerald-800">1 gls</td><td class="py-1 px-2 text-right text-gray-400">30</td><td class="py-1 px-3 text-right font-semibold">₹30</td></tr>
                    <tr class="bg-gray-50/70"><td class="py-1 px-3 font-medium">04 Nov (Wed)</td><td class="py-1 px-2 text-center font-bold text-emerald-800">1 gls</td><td class="py-1 px-2 text-right text-gray-400">30</td><td class="py-1 px-3 text-right font-semibold">₹30</td></tr>
                    <tr class="bg-amber-50/60 text-amber-800"><td class="py-1 px-3 font-medium">05 Nov (Thu)</td><td class="py-1 px-2 text-center italic text-gray-400 text-[10px]">Skip</td><td class="py-1 px-2 text-right text-gray-300">—</td><td class="py-1 px-3 text-right font-semibold text-gray-400">₹0</td></tr>
                    <tr class="bg-gray-50/70"><td class="py-1 px-3 font-medium">06 Nov (Fri)</td><td class="py-1 px-2 text-center font-bold text-emerald-800">1 gls</td><td class="py-1 px-2 text-right text-gray-400">30</td><td class="py-1 px-3 text-right font-semibold">₹30</td></tr>
                    <tr class="bg-white"><td class="py-1 px-3 font-medium">07 Nov (Sat)</td><td class="py-1 px-2 text-center font-bold text-emerald-800">1 gls</td><td class="py-1 px-2 text-right text-gray-400">30</td><td class="py-1 px-3 text-right font-semibold">₹30</td></tr>
                    <tr class="bg-gray-50/70"><td class="py-1 px-3 font-medium">08 Nov (Sun)</td><td class="py-1 px-2 text-center font-bold text-emerald-800">1 gls</td><td class="py-1 px-2 text-right text-gray-400">30</td><td class="py-1 px-3 text-right font-semibold">₹30</td></tr>
                    <tr class="bg-white"><td class="py-1 px-3 font-medium">09 Nov (Mon)</td><td class="py-1 px-2 text-center font-bold text-emerald-800">1 gls</td><td class="py-1 px-2 text-right text-gray-400">30</td><td class="py-1 px-3 text-right font-semibold">₹30</td></tr>
                    <tr class="bg-gray-50/70"><td class="py-1 px-3 font-medium">10 Nov (Tue)</td><td class="py-1 px-2 text-center font-bold text-emerald-800">1 gls</td><td class="py-1 px-2 text-right text-gray-400">30</td><td class="py-1 px-3 text-right font-semibold">₹30</td></tr>
                    <tr class="bg-white"><td class="py-1 px-3 font-medium">11 Nov (Wed)</td><td class="py-1 px-2 text-center font-bold text-emerald-800">1 gls</td><td class="py-1 px-2 text-right text-gray-400">30</td><td class="py-1 px-3 text-right font-semibold">₹30</td></tr>
                    <tr class="bg-gray-50/70"><td class="py-1 px-3 font-medium">12 Nov (Thu)</td><td class="py-1 px-2 text-center font-bold text-emerald-800">1 gls</td><td class="py-1 px-2 text-right text-gray-400">30</td><td class="py-1 px-3 text-right font-semibold">₹30</td></tr>
                    <tr class="bg-white"><td class="py-1 px-3 font-medium">13 Nov (Fri)</td><td class="py-1 px-2 text-center font-bold text-emerald-800">1 gls</td><td class="py-1 px-2 text-right text-gray-400">30</td><td class="py-1 px-3 text-right font-semibold">₹30</td></tr>
                    <tr class="bg-gray-50/70"><td class="py-1 px-3 font-medium">14 Nov (Sat)</td><td class="py-1 px-2 text-center font-bold text-emerald-800">1 gls</td><td class="py-1 px-2 text-right text-gray-400">30</td><td class="py-1 px-3 text-right font-semibold">₹30</td></tr>
                    <tr class="bg-white"><td class="py-1 px-3 font-medium">15 Nov (Sun)</td><td class="py-1 px-2 text-center font-bold text-emerald-800">1 gls</td><td class="py-1 px-2 text-right text-gray-400">30</td><td class="py-1 px-3 text-right font-semibold">₹30</td></tr>
                  </tbody>
                </table>
              </div>

              <!-- Right Column: Days 16-30 -->
              <div class="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table class="w-full text-left">
                  <thead class="bg-emerald-800 text-white font-bold text-[10px] uppercase tracking-wider">
                    <tr>
                      <th class="py-1.5 px-3">Date</th>
                      <th class="py-1.5 px-2 text-center">Glasses</th>
                      <th class="py-1.5 px-2 text-right">Rate</th>
                      <th class="py-1.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100 text-[11px]">
                    <tr class="bg-white"><td class="py-1 px-3 font-medium">16 Nov (Mon)</td><td class="py-1 px-2 text-center font-bold text-emerald-800">1 gls</td><td class="py-1 px-2 text-right text-gray-400">30</td><td class="py-1 px-3 text-right font-semibold">₹30</td></tr>
                    <tr class="bg-gray-50/70"><td class="py-1 px-3 font-medium">17 Nov (Tue)</td><td class="py-1 px-2 text-center font-bold text-emerald-800">1 gls</td><td class="py-1 px-2 text-right text-gray-400">30</td><td class="py-1 px-3 text-right font-semibold">₹30</td></tr>
                    <tr class="bg-white"><td class="py-1 px-3 font-medium">18 Nov (Wed)</td><td class="py-1 px-2 text-center font-bold text-emerald-800">1 gls</td><td class="py-1 px-2 text-right text-gray-400">30</td><td class="py-1 px-3 text-right font-semibold">₹30</td></tr>
                    <tr class="bg-gray-50/70"><td class="py-1 px-3 font-medium">19 Nov (Thu)</td><td class="py-1 px-2 text-center font-bold text-emerald-800">1 gls</td><td class="py-1 px-2 text-right text-gray-400">30</td><td class="py-1 px-3 text-right font-semibold">₹30</td></tr>
                    <tr class="bg-white"><td class="py-1 px-3 font-medium">20 Nov (Fri)</td><td class="py-1 px-2 text-center font-bold text-emerald-800">1 gls</td><td class="py-1 px-2 text-right text-gray-400">30</td><td class="py-1 px-3 text-right font-semibold">₹30</td></tr>
                    <tr class="bg-amber-50/60 text-amber-800"><td class="py-1 px-3 font-medium">21 Nov (Sat)</td><td class="py-1 px-2 text-center italic text-gray-400 text-[10px]">Skip</td><td class="py-1 px-2 text-right text-gray-300">—</td><td class="py-1 px-3 text-right font-semibold text-gray-400">₹0</td></tr>
                    <tr class="bg-white"><td class="py-1 px-3 font-medium">22 Nov (Sun)</td><td class="py-1 px-2 text-center font-bold text-emerald-800">1 gls</td><td class="py-1 px-2 text-right text-gray-400">30</td><td class="py-1 px-3 text-right font-semibold">₹30</td></tr>
                    <tr class="bg-gray-50/70"><td class="py-1 px-3 font-medium">23 Nov (Mon)</td><td class="py-1 px-2 text-center font-bold text-emerald-800">1 gls</td><td class="py-1 px-2 text-right text-gray-400">30</td><td class="py-1 px-3 text-right font-semibold">₹30</td></tr>
                    <tr class="bg-white"><td class="py-1 px-3 font-medium">24 Nov (Tue)</td><td class="py-1 px-2 text-center font-bold text-emerald-800">1 gls</td><td class="py-1 px-2 text-right text-gray-400">30</td><td class="py-1 px-3 text-right font-semibold">₹30</td></tr>
                    <tr class="bg-gray-50/70"><td class="py-1 px-3 font-medium">25 Nov (Wed)</td><td class="py-1 px-2 text-center font-bold text-emerald-800">1 gls</td><td class="py-1 px-2 text-right text-gray-400">30</td><td class="py-1 px-3 text-right font-semibold">₹30</td></tr>
                    <tr class="bg-white"><td class="py-1 px-3 font-medium">26 Nov (Thu)</td><td class="py-1 px-2 text-center font-bold text-emerald-800">1 gls</td><td class="py-1 px-2 text-right text-gray-400">30</td><td class="py-1 px-3 text-right font-semibold">₹30</td></tr>
                    <tr class="bg-gray-50/70"><td class="py-1 px-3 font-medium">27 Nov (Fri)</td><td class="py-1 px-2 text-center font-bold text-emerald-800">1 gls</td><td class="py-1 px-2 text-right text-gray-400">30</td><td class="py-1 px-3 text-right font-semibold">₹30</td></tr>
                    <tr class="bg-white"><td class="py-1 px-3 font-medium">28 Nov (Sat)</td><td class="py-1 px-2 text-center font-bold text-emerald-800">1 gls</td><td class="py-1 px-2 text-right text-gray-400">30</td><td class="py-1 px-3 text-right font-semibold">₹30</td></tr>
                    <tr class="bg-gray-50/70"><td class="py-1 px-3 font-medium">29 Nov (Sun)</td><td class="py-1 px-2 text-center font-bold text-emerald-800">1 gls</td><td class="py-1 px-2 text-right text-gray-400">30</td><td class="py-1 px-3 text-right font-semibold">₹30</td></tr>
                    <tr class="bg-white"><td class="py-1 px-3 font-medium">30 Nov (Mon)</td><td class="py-1 px-2 text-center font-bold text-emerald-800">1 gls</td><td class="py-1 px-2 text-right text-gray-400">30</td><td class="py-1 px-3 text-right font-semibold">₹30</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Section: PhonePe QR & Calculation Breakdown (Side-by-Side) -->
        <div class="mt-6 pt-4 border-t-2 border-emerald-900/20">
          <div class="grid grid-cols-12 gap-4 items-center">
            
            <!-- Left: PhonePe QR Card -->
            <div class="col-span-6 bg-gradient-to-br from-emerald-50 to-green-100/70 border border-emerald-200 rounded-2xl p-4 flex items-center gap-4">
              <div class="p-1.5 bg-white rounded-xl shadow-md border border-emerald-300">
                <img src="{qr_src}" alt="PhonePe QR" class="w-24 h-24 rounded-lg object-contain">
              </div>
              <div>
                <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-800 text-white">
                  Scan & Pay via UPI
                </span>
                <p class="text-xs font-mono font-bold text-emerald-950 mt-1.5">7306874214-2@ybl</p>
                <p class="text-[11px] text-gray-600 mt-0.5 font-medium">Name: <b>JISHNU K JAYAN</b></p>
                <p class="text-[10px] text-emerald-800 mt-1">GPay • PhonePe • Paytm • Any UPI</p>
              </div>
            </div>

            <!-- Right: Calculation Breakdown & Grand Total Due -->
            <div class="col-span-6 bg-gray-50 border border-gray-200 rounded-2xl p-4">
              <div class="space-y-1.5 text-xs text-gray-600">
                <div class="flex justify-between">
                  <span>Subtotal (28 glasses × ₹30):</span>
                  <span class="font-bold text-gray-800">₹840.00</span>
                </div>
                <div class="flex justify-between text-emerald-700">
                  <span>Advance Received:</span>
                  <span class="font-bold">- ₹0.00</span>
                </div>
                <div class="flex justify-between text-gray-500">
                  <span>Previous Balance Due:</span>
                  <span class="font-bold">₹0.00</span>
                </div>
                <div class="pt-2 border-t border-gray-300 flex justify-between items-baseline">
                  <span class="text-xs font-black uppercase text-emerald-900">Total Amount Due:</span>
                  <span class="text-2xl font-black text-emerald-800">₹840.00</span>
                </div>
              </div>
            </div>

          </div>

          <!-- Bottom Footer Line -->
          <div class="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
            <p>Thank you for supporting pure natural farming! • The Lamb House Goat Farm, Mananthavady</p>
            <p class="font-mono">Authorized Signatory / System Generated</p>
          </div>
        </div>

      </div>
    </div>


    <!-- ==================== MODEL 2: FARMSTEAD HERITAGE ==================== -->
    <div id="model-2" class="model-view hidden">
      <div class="text-center mb-3">
        <span class="text-xs font-semibold uppercase tracking-wider text-amber-300 bg-amber-950/60 border border-amber-800 px-3 py-1 rounded-full">
          Model 2 • Artisan Heritage Farmstead • Warm Earthy Cream & Centered Farm Crest
        </span>
      </div>

      <div class="a4-sheet p-8" style="background: #faf8f5;">
        <!-- Top Ornate Border & Centered Crest -->
        <div>
          <div class="text-center border-b-2 border-emerald-800 pb-5">
            <div class="flex justify-center mb-2">
              <img src="{logo_src}" alt="Logo" class="w-20 h-20 rounded-full border-4 border-emerald-800 shadow-md object-cover bg-white p-1">
            </div>
            <h1 class="serif-title text-3xl font-black tracking-wide text-emerald-950">THE LAMB HOUSE</h1>
            <p class="text-xs font-bold uppercase tracking-widest text-emerald-800 mt-0.5">Organic Goat Farm & Dairy Estate</p>
            <p class="text-xs text-stone-600 mt-1">Mananthavady, Wayanad District, Kerala - 670645 • Ph: 7306874214 / 9061237526</p>
            <div class="mt-2.5 inline-block border-y border-stone-300 py-1 px-8 text-xs font-bold uppercase tracking-widest text-stone-700">
              Official Monthly Milk Delivery Statement
            </div>
          </div>

          <!-- Bill To Bar -->
          <div class="mt-4 bg-white border border-stone-200 rounded-xl p-4 flex justify-between items-center shadow-sm">
            <div>
              <p class="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Customer</p>
              <h3 class="text-base font-bold text-stone-900">Muhammed Shafi</h3>
              <p class="text-xs text-stone-500">Thannikkal House, Payyampally, Mananthavady • Mob: 98471 23456</p>
            </div>
            <div class="text-right">
              <p class="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Billing Period</p>
              <p class="text-sm font-black text-emerald-900">November 2026</p>
              <p class="text-xs font-mono text-stone-500">Invoice: #LH-202611-001</p>
            </div>
          </div>

          <!-- Dual Calendar Table -->
          <div class="mt-4">
            <div class="grid grid-cols-2 gap-3 text-xs">
              <!-- Col 1 -->
              <div class="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
                <div class="bg-emerald-900 text-amber-100 font-bold px-3 py-1.5 text-[11px] uppercase tracking-wider flex justify-between">
                  <span>Part 1 (Days 1 – 15)</span>
                  <span class="text-[10px] text-amber-200/80">Rate: ₹30/glass</span>
                </div>
                <table class="w-full text-left">
                  <tbody class="divide-y divide-stone-100 text-[11px]">
                    <tr class="hover:bg-emerald-50/50"><td class="py-1 px-3 font-semibold text-stone-700">01 Nov</td><td class="py-1 text-emerald-800 font-bold">1 Glass (200ml)</td><td class="py-1 px-3 text-right font-mono font-bold">₹30</td></tr>
                    <tr class="bg-stone-50/60"><td class="py-1 px-3 font-semibold text-stone-700">02 Nov</td><td class="py-1 text-emerald-800 font-bold">1 Glass (200ml)</td><td class="py-1 px-3 text-right font-mono font-bold">₹30</td></tr>
                    <tr class="hover:bg-emerald-50/50"><td class="py-1 px-3 font-semibold text-stone-700">03 Nov</td><td class="py-1 text-emerald-800 font-bold">1 Glass (200ml)</td><td class="py-1 px-3 text-right font-mono font-bold">₹30</td></tr>
                    <tr class="bg-stone-50/60"><td class="py-1 px-3 font-semibold text-stone-700">04 Nov</td><td class="py-1 text-emerald-800 font-bold">1 Glass (200ml)</td><td class="py-1 px-3 text-right font-mono font-bold">₹30</td></tr>
                    <tr class="bg-amber-100/50 text-amber-900"><td class="py-1 px-3 font-semibold">05 Nov</td><td class="py-1 italic text-stone-400">Skip / Not Delivered</td><td class="py-1 px-3 text-right font-mono text-stone-400">₹0</td></tr>
                    <tr class="bg-stone-50/60"><td class="py-1 px-3 font-semibold text-stone-700">06 Nov</td><td class="py-1 text-emerald-800 font-bold">1 Glass (200ml)</td><td class="py-1 px-3 text-right font-mono font-bold">₹30</td></tr>
                    <tr class="hover:bg-emerald-50/50"><td class="py-1 px-3 font-semibold text-stone-700">07 Nov</td><td class="py-1 text-emerald-800 font-bold">1 Glass (200ml)</td><td class="py-1 px-3 text-right font-mono font-bold">₹30</td></tr>
                    <tr class="bg-stone-50/60"><td class="py-1 px-3 font-semibold text-stone-700">08 Nov</td><td class="py-1 text-emerald-800 font-bold">1 Glass (200ml)</td><td class="py-1 px-3 text-right font-mono font-bold">₹30</td></tr>
                    <tr class="hover:bg-emerald-50/50"><td class="py-1 px-3 font-semibold text-stone-700">09 Nov</td><td class="py-1 text-emerald-800 font-bold">1 Glass (200ml)</td><td class="py-1 px-3 text-right font-mono font-bold">₹30</td></tr>
                    <tr class="bg-stone-50/60"><td class="py-1 px-3 font-semibold text-stone-700">10 Nov</td><td class="py-1 text-emerald-800 font-bold">1 Glass (200ml)</td><td class="py-1 px-3 text-right font-mono font-bold">₹30</td></tr>
                    <tr class="hover:bg-emerald-50/50"><td class="py-1 px-3 font-semibold text-stone-700">11 Nov</td><td class="py-1 text-emerald-800 font-bold">1 Glass (200ml)</td><td class="py-1 px-3 text-right font-mono font-bold">₹30</td></tr>
                    <tr class="bg-stone-50/60"><td class="py-1 px-3 font-semibold text-stone-700">12 Nov</td><td class="py-1 text-emerald-800 font-bold">1 Glass (200ml)</td><td class="py-1 px-3 text-right font-mono font-bold">₹30</td></tr>
                    <tr class="hover:bg-emerald-50/50"><td class="py-1 px-3 font-semibold text-stone-700">13 Nov</td><td class="py-1 text-emerald-800 font-bold">1 Glass (200ml)</td><td class="py-1 px-3 text-right font-mono font-bold">₹30</td></tr>
                    <tr class="bg-stone-50/60"><td class="py-1 px-3 font-semibold text-stone-700">14 Nov</td><td class="py-1 text-emerald-800 font-bold">1 Glass (200ml)</td><td class="py-1 px-3 text-right font-mono font-bold">₹30</td></tr>
                    <tr class="hover:bg-emerald-50/50"><td class="py-1 px-3 font-semibold text-stone-700">15 Nov</td><td class="py-1 text-emerald-800 font-bold">1 Glass (200ml)</td><td class="py-1 px-3 text-right font-mono font-bold">₹30</td></tr>
                  </tbody>
                </table>
              </div>

              <!-- Col 2 -->
              <div class="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
                <div class="bg-emerald-900 text-amber-100 font-bold px-3 py-1.5 text-[11px] uppercase tracking-wider flex justify-between">
                  <span>Part 2 (Days 16 – 30)</span>
                  <span class="text-[10px] text-amber-200/80">Rate: ₹30/glass</span>
                </div>
                <table class="w-full text-left">
                  <tbody class="divide-y divide-stone-100 text-[11px]">
                    <tr class="hover:bg-emerald-50/50"><td class="py-1 px-3 font-semibold text-stone-700">16 Nov</td><td class="py-1 text-emerald-800 font-bold">1 Glass (200ml)</td><td class="py-1 px-3 text-right font-mono font-bold">₹30</td></tr>
                    <tr class="bg-stone-50/60"><td class="py-1 px-3 font-semibold text-stone-700">17 Nov</td><td class="py-1 text-emerald-800 font-bold">1 Glass (200ml)</td><td class="py-1 px-3 text-right font-mono font-bold">₹30</td></tr>
                    <tr class="hover:bg-emerald-50/50"><td class="py-1 px-3 font-semibold text-stone-700">18 Nov</td><td class="py-1 text-emerald-800 font-bold">1 Glass (200ml)</td><td class="py-1 px-3 text-right font-mono font-bold">₹30</td></tr>
                    <tr class="bg-stone-50/60"><td class="py-1 px-3 font-semibold text-stone-700">19 Nov</td><td class="py-1 text-emerald-800 font-bold">1 Glass (200ml)</td><td class="py-1 px-3 text-right font-mono font-bold">₹30</td></tr>
                    <tr class="hover:bg-emerald-50/50"><td class="py-1 px-3 font-semibold text-stone-700">20 Nov</td><td class="py-1 text-emerald-800 font-bold">1 Glass (200ml)</td><td class="py-1 px-3 text-right font-mono font-bold">₹30</td></tr>
                    <tr class="bg-amber-100/50 text-amber-900"><td class="py-1 px-3 font-semibold">21 Nov</td><td class="py-1 italic text-stone-400">Skip / Not Delivered</td><td class="py-1 px-3 text-right font-mono text-stone-400">₹0</td></tr>
                    <tr class="hover:bg-emerald-50/50"><td class="py-1 px-3 font-semibold text-stone-700">22 Nov</td><td class="py-1 text-emerald-800 font-bold">1 Glass (200ml)</td><td class="py-1 px-3 text-right font-mono font-bold">₹30</td></tr>
                    <tr class="bg-stone-50/60"><td class="py-1 px-3 font-semibold text-stone-700">23 Nov</td><td class="py-1 text-emerald-800 font-bold">1 Glass (200ml)</td><td class="py-1 px-3 text-right font-mono font-bold">₹30</td></tr>
                    <tr class="hover:bg-emerald-50/50"><td class="py-1 px-3 font-semibold text-stone-700">24 Nov</td><td class="py-1 text-emerald-800 font-bold">1 Glass (200ml)</td><td class="py-1 px-3 text-right font-mono font-bold">₹30</td></tr>
                    <tr class="bg-stone-50/60"><td class="py-1 px-3 font-semibold text-stone-700">25 Nov</td><td class="py-1 text-emerald-800 font-bold">1 Glass (200ml)</td><td class="py-1 px-3 text-right font-mono font-bold">₹30</td></tr>
                    <tr class="hover:bg-emerald-50/50"><td class="py-1 px-3 font-semibold text-stone-700">26 Nov</td><td class="py-1 text-emerald-800 font-bold">1 Glass (200ml)</td><td class="py-1 px-3 text-right font-mono font-bold">₹30</td></tr>
                    <tr class="bg-stone-50/60"><td class="py-1 px-3 font-semibold text-stone-700">27 Nov</td><td class="py-1 text-emerald-800 font-bold">1 Glass (200ml)</td><td class="py-1 px-3 text-right font-mono font-bold">₹30</td></tr>
                    <tr class="hover:bg-emerald-50/50"><td class="py-1 px-3 font-semibold text-stone-700">28 Nov</td><td class="py-1 text-emerald-800 font-bold">1 Glass (200ml)</td><td class="py-1 px-3 text-right font-mono font-bold">₹30</td></tr>
                    <tr class="bg-stone-50/60"><td class="py-1 px-3 font-semibold text-stone-700">29 Nov</td><td class="py-1 text-emerald-800 font-bold">1 Glass (200ml)</td><td class="py-1 px-3 text-right font-mono font-bold">₹30</td></tr>
                    <tr class="hover:bg-emerald-50/50"><td class="py-1 px-3 font-semibold text-stone-700">30 Nov</td><td class="py-1 text-emerald-800 font-bold">1 Glass (200ml)</td><td class="py-1 px-3 text-right font-mono font-bold">₹30</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Artisan Bottom Box -->
        <div class="mt-6 pt-4 border-t-2 border-emerald-900/20">
          <div class="grid grid-cols-12 gap-4 items-center">
            
            <div class="col-span-5 bg-white border border-stone-200 rounded-xl p-3 flex items-center gap-3 shadow-sm">
              <img src="{qr_src}" alt="QR" class="w-20 h-20 rounded border border-stone-300">
              <div class="text-[11px]">
                <p class="font-bold text-emerald-900 uppercase">UPI / PhonePe</p>
                <p class="font-mono font-bold text-stone-800 mt-1">7306874214-2@ybl</p>
                <p class="text-stone-500 text-[10px]">A/c: Jishnu K Jayan</p>
              </div>
            </div>

            <div class="col-span-7 bg-emerald-950 text-white rounded-xl p-4 shadow-md">
              <div class="flex justify-between items-center text-xs text-emerald-200 mb-2 border-b border-emerald-800 pb-2">
                <span>Delivered: <b>28 Days (28 Glasses)</b></span>
                <span>Rate: <b>₹30</b></span>
              </div>
              <div class="flex justify-between items-baseline">
                <div>
                  <span class="text-[10px] font-bold uppercase tracking-widest text-emerald-300">Total Payable Amount</span>
                  <p class="text-xs text-emerald-100">Advance/Balance: Nil</p>
                </div>
                <span class="text-3xl font-black text-amber-300">₹840.00</span>
              </div>
            </div>

          </div>

          <p class="text-center text-[10px] text-stone-400 mt-4">
            Thank you for choosing pure healthy goat milk • Farm Fresh Everyday
          </p>
        </div>

      </div>
    </div>


    <!-- ==================== MODEL 3: LUXE CLEAN SLATE ==================== -->
    <div id="model-3" class="model-view hidden">
      <div class="text-center mb-3">
        <span class="text-xs font-semibold uppercase tracking-wider text-teal-300 bg-teal-950/60 border border-teal-800 px-3 py-1 rounded-full">
          Model 3 • Luxe Clean Slate • Modern High-End Swiss Aesthetic & Clean Grid
        </span>
      </div>

      <div class="a4-sheet p-8">
        <!-- Clean Minimal Header -->
        <div>
          <div class="flex justify-between items-start border-b-2 border-slate-900 pb-6">
            <div class="flex items-center gap-4">
              <img src="{logo_src}" alt="Logo" class="w-16 h-16 rounded-full border border-slate-200 shadow-sm object-cover">
              <div>
                <h1 class="text-xl font-black tracking-tight text-slate-900">THE LAMB HOUSE GOAT FARM</h1>
                <p class="text-xs text-slate-500 font-medium">Mananthavady, Wayanad, Kerala - 670645</p>
                <p class="text-xs text-emerald-700 font-semibold mt-0.5">Contact: +91 7306874214 / 9061237526</p>
              </div>
            </div>
            <div class="text-right">
              <h2 class="text-2xl font-black text-emerald-800 tracking-tight">INVOICE</h2>
              <p class="text-xs font-mono text-slate-400 mt-0.5">#INV-2026-11-001</p>
              <p class="text-xs font-bold text-slate-700 mt-1">Date: 30 Nov 2026</p>
            </div>
          </div>

          <!-- 3-Column Info strip -->
          <div class="grid grid-cols-3 gap-4 py-4 border-b border-slate-100 text-xs">
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bill To</p>
              <p class="font-bold text-slate-900 text-sm mt-0.5">Muhammed Shafi</p>
              <p class="text-slate-500">Payyampally, Mananthavady</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Service Period</p>
              <p class="font-bold text-slate-900 text-sm mt-0.5">01 Nov – 30 Nov 2026</p>
              <p class="text-slate-500">Standard Delivery (Daily)</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Delivery Summary</p>
              <p class="font-bold text-emerald-700 text-sm mt-0.5">28 Delivered / 2 Skips</p>
              <p class="text-slate-500">Total: 28 Glasses (5.6L)</p>
            </div>
          </div>

          <!-- Compact 2-Col Table -->
          <div class="mt-4">
            <div class="grid grid-cols-2 gap-4 text-xs">
              <!-- Left side -->
              <div class="border border-slate-200 rounded-lg overflow-hidden">
                <div class="bg-slate-100 font-bold px-3 py-1.5 text-[10px] uppercase text-slate-600 flex justify-between">
                  <span>Days 01 – 15</span>
                  <span>Amount</span>
                </div>
                <div class="divide-y divide-slate-100 text-[11px]">
                  <div class="px-3 py-1 flex justify-between"><span>01 Nov (Sun)</span><span class="font-bold text-emerald-800">1 gls • ₹30</span></div>
                  <div class="px-3 py-1 bg-slate-50/50 flex justify-between"><span>02 Nov (Mon)</span><span class="font-bold text-emerald-800">1 gls • ₹30</span></div>
                  <div class="px-3 py-1 flex justify-between"><span>03 Nov (Tue)</span><span class="font-bold text-emerald-800">1 gls • ₹30</span></div>
                  <div class="px-3 py-1 bg-slate-50/50 flex justify-between"><span>04 Nov (Wed)</span><span class="font-bold text-emerald-800">1 gls • ₹30</span></div>
                  <div class="px-3 py-1 bg-amber-50 text-amber-800 flex justify-between"><span>05 Nov (Thu)</span><span class="italic text-slate-400">Skip • ₹0</span></div>
                  <div class="px-3 py-1 flex justify-between"><span>06 Nov (Fri)</span><span class="font-bold text-emerald-800">1 gls • ₹30</span></div>
                  <div class="px-3 py-1 bg-slate-50/50 flex justify-between"><span>07 Nov (Sat)</span><span class="font-bold text-emerald-800">1 gls • ₹30</span></div>
                  <div class="px-3 py-1 flex justify-between"><span>08 Nov (Sun)</span><span class="font-bold text-emerald-800">1 gls • ₹30</span></div>
                  <div class="px-3 py-1 bg-slate-50/50 flex justify-between"><span>09 Nov (Mon)</span><span class="font-bold text-emerald-800">1 gls • ₹30</span></div>
                  <div class="px-3 py-1 flex justify-between"><span>10 Nov (Tue)</span><span class="font-bold text-emerald-800">1 gls • ₹30</span></div>
                  <div class="px-3 py-1 bg-slate-50/50 flex justify-between"><span>11 Nov (Wed)</span><span class="font-bold text-emerald-800">1 gls • ₹30</span></div>
                  <div class="px-3 py-1 flex justify-between"><span>12 Nov (Thu)</span><span class="font-bold text-emerald-800">1 gls • ₹30</span></div>
                  <div class="px-3 py-1 bg-slate-50/50 flex justify-between"><span>13 Nov (Fri)</span><span class="font-bold text-emerald-800">1 gls • ₹30</span></div>
                  <div class="px-3 py-1 flex justify-between"><span>14 Nov (Sat)</span><span class="font-bold text-emerald-800">1 gls • ₹30</span></div>
                  <div class="px-3 py-1 bg-slate-50/50 flex justify-between"><span>15 Nov (Sun)</span><span class="font-bold text-emerald-800">1 gls • ₹30</span></div>
                </div>
              </div>

              <!-- Right side -->
              <div class="border border-slate-200 rounded-lg overflow-hidden">
                <div class="bg-slate-100 font-bold px-3 py-1.5 text-[10px] uppercase text-slate-600 flex justify-between">
                  <span>Days 16 – 30</span>
                  <span>Amount</span>
                </div>
                <div class="divide-y divide-slate-100 text-[11px]">
                  <div class="px-3 py-1 flex justify-between"><span>16 Nov (Mon)</span><span class="font-bold text-emerald-800">1 gls • ₹30</span></div>
                  <div class="px-3 py-1 bg-slate-50/50 flex justify-between"><span>17 Nov (Tue)</span><span class="font-bold text-emerald-800">1 gls • ₹30</span></div>
                  <div class="px-3 py-1 flex justify-between"><span>18 Nov (Wed)</span><span class="font-bold text-emerald-800">1 gls • ₹30</span></div>
                  <div class="px-3 py-1 bg-slate-50/50 flex justify-between"><span>19 Nov (Thu)</span><span class="font-bold text-emerald-800">1 gls • ₹30</span></div>
                  <div class="px-3 py-1 flex justify-between"><span>20 Nov (Fri)</span><span class="font-bold text-emerald-800">1 gls • ₹30</span></div>
                  <div class="px-3 py-1 bg-amber-50 text-amber-800 flex justify-between"><span>21 Nov (Sat)</span><span class="italic text-slate-400">Skip • ₹0</span></div>
                  <div class="px-3 py-1 flex justify-between"><span>22 Nov (Sun)</span><span class="font-bold text-emerald-800">1 gls • ₹30</span></div>
                  <div class="px-3 py-1 bg-slate-50/50 flex justify-between"><span>23 Nov (Mon)</span><span class="font-bold text-emerald-800">1 gls • ₹30</span></div>
                  <div class="px-3 py-1 flex justify-between"><span>24 Nov (Tue)</span><span class="font-bold text-emerald-800">1 gls • ₹30</span></div>
                  <div class="px-3 py-1 bg-slate-50/50 flex justify-between"><span>25 Nov (Wed)</span><span class="font-bold text-emerald-800">1 gls • ₹30</span></div>
                  <div class="px-3 py-1 flex justify-between"><span>26 Nov (Thu)</span><span class="font-bold text-emerald-800">1 gls • ₹30</span></div>
                  <div class="px-3 py-1 bg-slate-50/50 flex justify-between"><span>27 Nov (Fri)</span><span class="font-bold text-emerald-800">1 gls • ₹30</span></div>
                  <div class="px-3 py-1 flex justify-between"><span>28 Nov (Sat)</span><span class="font-bold text-emerald-800">1 gls • ₹30</span></div>
                  <div class="px-3 py-1 bg-slate-50/50 flex justify-between"><span>29 Nov (Sun)</span><span class="font-bold text-emerald-800">1 gls • ₹30</span></div>
                  <div class="px-3 py-1 flex justify-between"><span>30 Nov (Mon)</span><span class="font-bold text-emerald-800">1 gls • ₹30</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Clean Minimal Bottom -->
        <div class="mt-6 pt-4 border-t border-slate-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <img src="{qr_src}" alt="QR" class="w-20 h-20 rounded border border-slate-200">
              <div class="text-xs">
                <span class="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-700 uppercase">Instant Payment</span>
                <p class="font-mono font-bold text-slate-900 mt-1">7306874214-2@ybl</p>
                <p class="text-slate-500 text-[11px]">Jishnu K Jayan (UPI)</p>
              </div>
            </div>

            <div class="text-right">
              <p class="text-xs text-slate-400">Total Net Amount Payable</p>
              <p class="text-3xl font-black text-slate-900 mt-0.5">₹840.00</p>
              <p class="text-[11px] text-emerald-600 font-semibold mt-0.5">✓ No Pending Balance</p>
            </div>
          </div>

          <p class="text-center text-[10px] text-slate-400 mt-4 border-t border-slate-100 pt-3">
            The Lamb House Goat Farm • Fresh pure goat milk delivered every morning
          </p>
        </div>

      </div>
    </div>

  </div>

  <script>
    function selectModel(id) {{
      document.querySelectorAll('.model-view').forEach(el => el.classList.add('hidden'));
      document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
      
      const target = document.getElementById('model-' + id);
      const tab = document.getElementById('tab-' + id);
      if (target) target.classList.remove('hidden');
      if (tab) tab.classList.add('active');
    }}
  </script>
</body>
</html>
"""

out_path = os.path.join(brain_dir, "invoice_templates.html")
with open(out_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"Generated {out_path} ({len(html_content)} bytes)")
