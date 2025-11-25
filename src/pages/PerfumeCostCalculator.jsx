import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { motion } from 'framer-motion';
import { ArrowLeft, Calculator, Download, DollarSign, Package, TrendingUp, AlertCircle, Info } from 'lucide-react';
import * as XLSX from 'xlsx';
import '../styles/admin.css';

const PerfumeCostCalculator = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  // Exchange Rate & Duties
  const [rate, setRate] = useState(24);
  const [vat, setVat] = useState(5);
  const [customs, setCustoms] = useState(20);
  const [sws, setSws] = useState(10);
  const [gst, setGst] = useState(18);
  const [cif, setCif] = useState('yes');

  // Per-Unit Costs
  const [bottle, setBottle] = useState(70);
  const [labels, setLabels] = useState(10);
  const [pack, setPack] = useState(20);
  const [ship, setShip] = useState(30);

  // Pricing
  const [sell, setSell] = useState(1000);
  const [sellIncludesGST, setSellIncludesGST] = useState('yes');

  // Default Concentrations
  const [conc1, setConc1] = useState(30);
  const [conc2, setConc2] = useState(25);
  const [conc3, setConc3] = useState(20);
  const [conc4, setConc4] = useState(15);

  // Oils Input
  const [oils, setOils] = useState(`Oud Maracuja, 700, 30, 1000, 50
Dior Sauvage, 450, 25, 600, 100
Arabian Rose, 600, 25
Luxury Oud, 1500, 30`);

  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('');

  // Helper functions
  const safeNum = (v, def = 0) => {
    v = ('' + v).trim();
    if (v === '') return def;
    const n = Number(v.replace(/,/g, ''));
    return isNaN(n) ? def : n;
  };

  const round = (v, d = 2) => {
    if (typeof v !== 'number') v = Number(v) || 0;
    const m = Math.pow(10, d);
    return Math.round(v * m) / m;
  };

  const getDefaultConcentrations = () => {
    return [conc1, conc2, conc3, conc4].filter(c => c > 0);
  };

  const parseOils = (text) => {
    const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    const parsed = [];
    for (let line of lines) {
      let parts = line.split(/[,;\t]/).map(p => p.trim()).filter(Boolean);
      if (parts.length < 2) continue;
      const name = parts[0];
      const aed = safeNum(parts[1], 0);
      const conc = parts.length >= 3 ? safeNum(parts[2], 0) : 0;
      const sellingPrice = parts.length >= 4 ? safeNum(parts[3], 0) : 0;
      const bottleSize = parts.length >= 5 ? safeNum(parts[4], 0) : 0;
      parsed.push({ name, aed, conc, sellingPrice, bottleSize });
    }
    return parsed;
  };

  const buildRows = (oilsParsed) => {
    const rows = [];
    const rateVal = rate;
    const vatPct = vat / 100;
    const customsPct = customs / 100;
    const swsPct = sws / 100;
    const gstPct = gst / 100;
    const defaultBottle = bottle;
    const labelsVal = labels;
    const packVal = pack;
    const shipVal = ship;
    const defaultSellingPrice = sell;
    const sellIncludesGSTVal = sellIncludesGST === 'yes';
    const cifVal = cif === 'yes';
    const defaultBottleSize = 50;

    const defaultConcs = getDefaultConcentrations();

    oilsParsed.forEach(item => {
      const concs = (item.conc && item.conc > 0) ? [item.conc] : defaultConcs;
      concs.forEach(conc => {
        const sellingPrice = (item.sellingPrice && item.sellingPrice > 0) ? item.sellingPrice : defaultSellingPrice;
        const bottleSize = (item.bottleSize && item.bottleSize > 0) ? item.bottleSize : defaultBottleSize;
        
        const sizeRatio = bottleSize / 50.0;
        const bottleCost = defaultBottle * sizeRatio;
        const labelsScaled = labelsVal * sizeRatio;
        const packScaled = packVal * sizeRatio;
        const shipScaled = shipVal * sizeRatio;
        
        const netSellingPrice = sellIncludesGSTVal ? (sellingPrice / (1 + gstPct)) : sellingPrice;
        const gstAmountTop = sellIncludesGSTVal ? (sellingPrice - netSellingPrice) : (netSellingPrice * gstPct);

        const oilMl = bottleSize * (conc / 100.0);
        const oilLitres = oilMl / 1000.0;
        const priceAED_perL = item.aed;
        const priceAED_used = priceAED_perL * oilLitres;
        const priceINR = priceAED_used * rateVal;
        const dubaiVAT = priceINR * vatPct;
        const landedOil = priceINR + dubaiVAT;
        const customsBase = cifVal ? (landedOil + shipScaled) : landedOil;
        const customsDuty = customsBase * customsPct;
        const swsAmount = customsDuty * swsPct;
        const totalBeforeGST = landedOil + customsDuty + swsAmount + bottleCost + labelsScaled + packScaled + shipScaled;
        const gstAmount = sellIncludesGSTVal ? gstAmountTop : (netSellingPrice * gstPct);
        const totalInclGST = totalBeforeGST + gstAmount;
        const profitExcl = netSellingPrice - totalBeforeGST;
        const profitIncl = sellingPrice - totalInclGST;
        const marginPct = netSellingPrice ? (profitExcl / netSellingPrice * 100) : 0;

        rows.push({
          name: item.name,
          bottleSize,
          conc,
          oilMl: round(oilMl, 3),
          aedPerL: round(priceAED_perL, 2),
          aedUsed: round(priceAED_used, 3),
          priceINR: round(priceINR, 2),
          dubaiVAT: round(dubaiVAT, 2),
          landedOil: round(landedOil, 2),
          customsBase: round(customsBase, 2),
          customsDuty: round(customsDuty, 2),
          swsAmount: round(swsAmount, 2),
          bottleCost: round(bottleCost, 2),
          labelsCost: round(labelsScaled, 2),
          packCost: round(packScaled, 2),
          shipCost: round(shipScaled, 2),
          totalBeforeGST: round(totalBeforeGST, 2),
          netSellingPrice: round(netSellingPrice, 2),
          gstAmount: round(gstAmount, 2),
          totalInclGST: round(totalInclGST, 2),
          sellingPrice,
          profitExcl: round(profitExcl, 2),
          profitIncl: round(profitIncl, 2),
          marginPct: round(marginPct, 2)
        });
      });
    });

    return rows;
  };

  // Update preview whenever inputs change
  useEffect(() => {
    const parsed = parseOils(oils);
    if (parsed.length > 0) {
      const calculatedRows = buildRows(parsed);
      setRows(calculatedRows);
    } else {
      setRows([]);
    }
  }, [rate, vat, customs, sws, gst, cif, bottle, labels, pack, ship, sell, sellIncludesGST, conc1, conc2, conc3, conc4, oils]);

  const downloadExcel = () => {
    setStatus('Generating Excel...');
    try {
      const headers = [
        "Oil Name", "Bottle Size (ml)", "Concentration %", "Oil ml used", "AED per L", "AED for used oil",
        "Price INR (oil qty)", "Dubai VAT (INR)", "Landed oil (INR)", "Customs base (INR)", "Customs duty (INR)",
        "SWS (INR)", "Bottle (₹)", "Labels (₹)", "Packaging (₹)", "Shipping (₹)", "Total before GST (₹)",
        "Net selling price (₹)", "GST amount (₹)", "Total incl GST (₹)", "Selling price (₹)",
        "Profit excl GST (₹)", "Profit incl GST (₹)", "Profit margin (%)"
      ];

      const data = rows.map(r => [
        r.name, r.bottleSize, r.conc, r.oilMl, r.aedPerL, r.aedUsed, r.priceINR, r.dubaiVAT,
        r.landedOil, r.customsBase, r.customsDuty, r.swsAmount, r.bottleCost, r.labelsCost,
        r.packCost, r.shipCost, r.totalBeforeGST, r.netSellingPrice, r.gstAmount, r.totalInclGST,
        r.sellingPrice, r.profitExcl, r.profitIncl, r.marginPct
      ]);

      const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
      
      const inputsData = [
        ["AED→INR rate", rate],
        ["Dubai VAT %", vat],
        ["Basic Customs Duty (BCD) %", customs],
        ["Social Welfare Surcharge (SWS) %", sws],
        ["GST %", gst],
        ["Apply BCD on shipping (CIF)?", cif === 'yes' ? "Yes" : "No"],
        ["Bottle (₹)", bottle],
        ["Labels (₹)", labels],
        ["Packaging (₹)", pack],
        ["Shipping (₹)", ship],
        ["Default selling price (₹)", sell],
        ["Selling price includes GST?", sellIncludesGST === 'yes' ? "Yes" : "No"],
        ["Default concentrations", `${conc1}%, ${conc2}%, ${conc3}%, ${conc4}%`]
      ];
      const ws2 = XLSX.utils.aoa_to_sheet(inputsData);

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Calculations");
      XLSX.utils.book_append_sheet(wb, ws2, "Inputs");

      XLSX.writeFile(wb, `perfume_cost_analysis_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      setStatus('✓ Excel downloaded successfully!');
      setTimeout(() => setStatus(''), 3000);
    } catch (err) {
      console.error(err);
      setStatus('Error generating Excel: ' + err.message);
    }
  };

  const getProfitClass = (margin) => {
    if (margin >= 30) return 'profit-positive';
    if (margin >= 15) return 'profit-neutral';
    return 'profit-negative';
  };

  return (
    <div className="admin-container">
      {/* Modern Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="calc-header"
      >
        <div className="calc-header-content">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="back-button"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <div className="calc-header-main">
            <div className="calc-icon-wrapper">
              <Calculator size={32} />
            </div>
            <div className="calc-header-text">
              <h1 className="calc-title">Perfume Cost Calculator</h1>
              <p className="calc-subtitle">Dubai to India Import • 2025 Tax Compliant</p>
            </div>
          </div>
          <div className="calc-header-badge">
            <span className="badge-text">Pro Tool</span>
          </div>
        </div>
      </motion.div>

      <div className="calculator-container">
        {/* Alert */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="alert alert-warning"
        >
          <AlertCircle size={20} />
          <div>
            <strong>2025 Update:</strong> Calculations include Social Welfare Surcharge (SWS) - 10% of Basic Customs Duty
          </div>
        </motion.div>

        {/* Exchange Rate & Duties */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="calc-card"
        >
          <h2>
            <DollarSign size={20} />
            Exchange Rate & Duties
          </h2>
          <div className="calc-grid">
            <div className="form-group">
              <label>AED → INR Exchange Rate</label>
              <input type="number" value={rate} onChange={(e) => setRate(safeNum(e.target.value, 24))} step="0.1" />
            </div>
            <div className="form-group">
              <label>Dubai VAT <span className="label-info">(on oil purchase)</span></label>
              <input type="number" value={vat} onChange={(e) => setVat(safeNum(e.target.value, 5))} step="0.1" />
            </div>
            <div className="form-group">
              <label>Basic Customs Duty (BCD) <span className="label-info">(%)</span></label>
              <input type="number" value={customs} onChange={(e) => setCustoms(safeNum(e.target.value, 20))} step="0.1" />
            </div>
            <div className="form-group">
              <label>Social Welfare Surcharge <span className="label-info">(% of BCD)</span></label>
              <input type="number" value={sws} onChange={(e) => setSws(safeNum(e.target.value, 10))} step="0.1" />
            </div>
            <div className="form-group">
              <label>GST <span className="label-info">(%)</span></label>
              <input type="number" value={gst} onChange={(e) => setGst(safeNum(e.target.value, 18))} step="0.1" />
            </div>
            <div className="form-group">
              <label>Apply BCD on Shipping? (CIF)</label>
              <select value={cif} onChange={(e) => setCif(e.target.value)}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Per-Unit Costs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="calc-card"
        >
          <h2>
            <Package size={20} />
            Per-Unit Costs (INR)
          </h2>
          <p className="card-subtitle">All costs are per 50ml bottle</p>
          <div className="calc-grid">
            <div className="form-group">
              <label>Bottle (₹)</label>
              <input type="number" value={bottle} onChange={(e) => setBottle(safeNum(e.target.value, 70))} step="1" />
            </div>
            <div className="form-group">
              <label>Labels & Caps (₹)</label>
              <input type="number" value={labels} onChange={(e) => setLabels(safeNum(e.target.value, 10))} step="1" />
            </div>
            <div className="form-group">
              <label>Packaging (₹)</label>
              <input type="number" value={pack} onChange={(e) => setPack(safeNum(e.target.value, 20))} step="1" />
            </div>
            <div className="form-group">
              <label>Shipping per Unit (₹)</label>
              <input type="number" value={ship} onChange={(e) => setShip(safeNum(e.target.value, 30))} step="1" />
            </div>
          </div>
        </motion.div>

        {/* Pricing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="calc-card"
        >
          <h2>
            <TrendingUp size={20} />
            Pricing
          </h2>
          <div className="calc-grid">
            <div className="form-group">
              <label>Default Selling Price (₹)</label>
              <input type="number" value={sell} onChange={(e) => setSell(safeNum(e.target.value, 1000))} step="10" />
            </div>
            <div className="form-group">
              <label>Selling Price Includes GST?</label>
              <select value={sellIncludesGST} onChange={(e) => setSellIncludesGST(e.target.value)}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Perfume Oils */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="calc-card"
        >
          <h2>🌺 Perfume Oils</h2>
          
          <div className="alert alert-info">
            <Info size={20} />
            <div>
              <strong>Format:</strong> <code>OilName, AED_per_litre, concentration%, sellingPrice, bottleSize_ml</code><br />
              <strong>Examples:</strong><br />
              • <code>Arabian Rose, 600, 25</code> - Uses default price (₹1000) and size (50ml)<br />
              • <code>Arabian Rose, 600, 25, 1200</code> - Custom selling price ₹1200 for 50ml<br />
              • <code>Arabian Rose, 600, 25, 1200, 100</code> - Custom price ₹1200 for 100ml bottle
            </div>
          </div>

          <div className="form-group">
            <label>Oil List <span className="label-info">(one per line)</span></label>
            <textarea
              value={oils}
              onChange={(e) => setOils(e.target.value)}
              rows={6}
              placeholder="Enter oils, one per line..."
            />
          </div>

          <h3>Default Concentrations</h3>
          <p className="card-subtitle">If no concentration is specified, these will be calculated:</p>
          <div className="calc-grid-small">
            <div className="form-group">
              <label>Conc 1 (%)</label>
              <input type="number" value={conc1} onChange={(e) => setConc1(safeNum(e.target.value, 30))} min="15" max="30" step="5" />
            </div>
            <div className="form-group">
              <label>Conc 2 (%)</label>
              <input type="number" value={conc2} onChange={(e) => setConc2(safeNum(e.target.value, 25))} min="15" max="30" step="5" />
            </div>
            <div className="form-group">
              <label>Conc 3 (%)</label>
              <input type="number" value={conc3} onChange={(e) => setConc3(safeNum(e.target.value, 20))} min="15" max="30" step="5" />
            </div>
            <div className="form-group">
              <label>Conc 4 (%)</label>
              <input type="number" value={conc4} onChange={(e) => setConc4(safeNum(e.target.value, 15))} min="15" max="30" step="5" />
            </div>
          </div>
        </motion.div>

        {/* Live Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="calc-card"
        >
          <h2>📊 Live Preview</h2>
          <div className="table-container">
            <table className="preview-table">
              <thead>
                <tr>
                  <th>Oil Name</th>
                  <th>Size (ml)</th>
                  <th>Conc %</th>
                  <th>Oil ml</th>
                  <th>AED/L</th>
                  <th>Oil Cost (₹)</th>
                  <th>BCD (₹)</th>
                  <th>SWS (₹)</th>
                  <th>Total Cost (₹)</th>
                  <th>Selling (₹)</th>
                  <th>Profit (₹)</th>
                  <th>Margin %</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan="12" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                      Add oils above to see calculations...
                    </td>
                  </tr>
                ) : (
                  rows.map((row, idx) => (
                    <tr key={idx}>
                      <td><strong>{row.name}</strong></td>
                      <td>{row.bottleSize}ml</td>
                      <td>{row.conc}%</td>
                      <td>{row.oilMl}</td>
                      <td>AED {row.aedPerL}</td>
                      <td>₹{row.priceINR}</td>
                      <td>₹{row.customsDuty}</td>
                      <td>₹{row.swsAmount}</td>
                      <td><strong>₹{row.totalInclGST}</strong></td>
                      <td>₹{row.sellingPrice}</td>
                      <td className={getProfitClass(row.marginPct)}>₹{row.profitIncl}</td>
                      <td className={getProfitClass(row.marginPct)}>{row.marginPct}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Download Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="calc-card"
        >
          <button
            onClick={downloadExcel}
            disabled={rows.length === 0}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            <Download size={20} />
            Download Excel Report
          </button>
          {status && (
            <div className={`status ${status.includes('✓') ? 'success' : status.includes('Error') ? 'error' : ''}`}>
              {status}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PerfumeCostCalculator;
