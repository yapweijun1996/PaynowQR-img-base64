
(function(){
		// If already defined by another file, exit.
		if (window.paynowQRify && window.paynowQRify._v) return;
		
		const CDN = {
			paynowqr:'https://unpkg.com/paynowqr@latest/dist/paynowqr.min.js',
			qrcode:  'https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js'
		};
		
		// Global registry for shared promises across includes
		const G = window.__paynowQR = window.__paynowQR || { p:{} };
		
		const toBool = v => (typeof v === 'string' ? v.toLowerCase() !== 'false' : !!v);
		
		function loadScriptOnce(url, globalName){
			if (window[globalName]) return Promise.resolve();
			if (G.p[url]) return G.p[url];
			G.p[url] = new Promise((res, rej)=>{
				const s = document.createElement('script');
				s.src = url; s.async = true;
				s.onload = res;
				s.onerror = () => rej(new Error('Failed to load '+url));
				document.head.appendChild(s);
			});
			return G.p[url];
		}
		
		function ensureLibs(){
			return Promise.all([
				loadScriptOnce(CDN.paynowqr, 'PaynowQR'),
				loadScriptOnce(CDN.qrcode,   'QRCode')
			]);
		}
		
		function loadImage(src){
			return new Promise((resolve, reject)=>{
				const img = new Image();
				img.crossOrigin = 'anonymous';
				img.onload = ()=>resolve(img);
				img.onerror = ()=>reject(new Error('Logo load failed'));
				img.src = src;
			});
		}
		
		async function renderOne(el, defaults){
			// Process-once guard unless rerender requested
			if (el.dataset.qrDone === '1' && !defaults.rerender) return;
			
			const ds = el.dataset || {};
			const cfg = {
				uen:       ds.uen,
				amount:    ds.amount !== undefined ? parseFloat(ds.amount) : undefined,
				editable:  toBool(ds.editable ?? false),
				expiry:    ds.expiry,
				refNumber: ds.refnumber || ds.refNumber,
				company:   ds.company
			};
			if (!cfg.uen || !cfg.expiry || !cfg.refNumber || !cfg.company)
			throw new Error('Missing required data-* (uen/expiry/refnumber/company)');
			if ((cfg.amount === undefined || Number.isNaN(cfg.amount)) && !cfg.editable)
			throw new Error('amount required unless data-editable="true"');
			
			const dark      = ds.dark      ?? defaults.dark      ?? '#79207a';
			const light     = ds.light     ?? defaults.light     ?? '#ffffff';
			const logo      = ds.logo      ?? defaults.logo      ?? null;   // base64 or URL
			const qrPx      = parseInt(ds.qrpx      ?? defaults.qrPx      ?? 500, 10);
			const displayPx = parseInt(ds.displaypx ?? defaults.displayPx ?? 50, 10);
			const logoScale = parseFloat(ds.logoscale ?? defaults.logoScale ?? 0.25);
			const padScale  = parseFloat(ds.padscale  ?? defaults.padScale  ?? 0.04);
			
			const payload = new PaynowQR(cfg).output();
			
			const canvas = document.createElement('canvas');
			canvas.width = canvas.height = qrPx;
			
			await QRCode.toCanvas(canvas, payload, {
				errorCorrectionLevel: 'H',
				margin: 1,
				width: qrPx,
				color: { dark, light }
			});
			
			if (logo){
				const ctx = canvas.getContext('2d');
				const img = await loadImage(logo);
				const c = qrPx / 2;
				const L = qrPx * logoScale;
				const B = L + qrPx * padScale;
				ctx.fillStyle = light;                              // square background
				ctx.fillRect(c - B/2, c - B/2, B, B);
				ctx.drawImage(img, c - L/2, c - L/2, L, L);         // logo
			}
			
			const dataUrl = canvas.toDataURL('image/png');
			
			let imgEl = el.tagName === 'IMG' ? el : el.querySelector('img');
			if (!imgEl){ imgEl = document.createElement('img'); el.appendChild(imgEl); }
			imgEl.src = dataUrl;
			imgEl.style.width = imgEl.style.height = displayPx + 'px';
			
			el.dataset.qrDone = '1';  // mark processed
			return dataUrl;
		}
		
		async function paynowQRify(selectorOrEls, opts = {}){
			await ensureLibs();
			const els = typeof selectorOrEls === 'string'
			? Array.from(document.querySelectorAll(selectorOrEls))
			: (selectorOrEls instanceof Element ? [selectorOrEls]
			: Array.from(selectorOrEls || []));
			if (!els.length) throw new Error('No targets found for ' + selectorOrEls);
			return Promise.all(els.map(el => renderOne(el, opts)));
		}
		
		window.paynowQRify = paynowQRify;
		window.paynowQRify._v = '1.1.0';
		
		// Drain queued calls made before helper loaded
		const q = window.__paynowQR_queue || [];
		delete window.__paynowQR_queue;
		q.forEach(args => paynowQRify(...args));
	})();

    

(window.paynowQRify
	? window.paynowQRify
	: (...a)=>((window.__paynowQR_queue=window.__paynowQR_queue||[]).push(a))
	)('.paynowQrSlot', {
		logo: (window.paynowLogoBase64 || null),
		displayPx: 50,
		dark: '#79207a',
		light: '#ffffff'
	});