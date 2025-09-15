let myChart;
let currentStep = 1;
const totalSteps = 4;
let kategoriVeri = {};

const emisyonFaktorleri = {
	ulasim: {
		benzin: 0.23,
		dizel: 0.27,
		elektrik: 0.04,
		otobus: 0.05,
		ucak: 0.15,
	},
	enerji: { elektrik: 0.4, dogalgaz: 2.1 },
	beslenme: { et: 2000, vejetaryen: 1000, vegan: 500 },
	su: 0.005,
	alisveris: { giyim: 50, elektronik: 150 },
	atik: { dusuk: 150, orta: 75, yuksek: 25 },
};

const kategoriIsimleri = {
	ulasim: "Ulaşım",
	enerji: "Enerji & Ev",
	beslenme: "Beslenme",
	su: "Su",
	alisveris_atik: "Alışveriş & Atık",
};

function updateProgressBar() {
	const progressBar = document.getElementById("progress-bar");
	const progressText = document.getElementById("progress-text");
	const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
	progressBar.style.width = `${progress}%`;
	progressText.innerText = `Adım ${currentStep} / ${totalSteps}`;
}

function nextStep() {
	const currentCard = document.getElementById(`step-${currentStep}`);
	currentCard.classList.add("hidden");
	if (currentStep < totalSteps) {
		currentStep++;
		document.getElementById(`step-${currentStep}`).classList.remove("hidden");
		updateProgressBar();
	} else {
		hesapla();
	}
}

function prevStep() {
	const currentCard = document.getElementById(`step-${currentStep}`);
	currentCard.classList.add("hidden");
	if (currentStep > 1) {
		currentStep--;
		document.getElementById(`step-${currentStep}`).classList.remove("hidden");
		updateProgressBar();
	}
}

function hesapla() {
	document.getElementById("calculator-form").classList.add("hidden");
	document.getElementById("progress-container").classList.add("hidden");
	document.getElementById("loading-spinner").classList.remove("hidden");

	setTimeout(() => {
		const arac_km =
			parseFloat(
				document.querySelector('input[name="arac_km"]:checked').value
			) || 0;
		const yakit_tipi = document.getElementById("yakit_tipi").value;
		const otobus_km =
			parseFloat(
				document.querySelector('input[name="otobus_km"]:checked').value
			) || 0;
		const ucak_km =
			parseFloat(
				document.querySelector('input[name="ucak_km"]:checked').value
			) || 0;
		const elektrik_kwh =
			parseFloat(
				document.querySelector('input[name="elektrik_kwh"]:checked').value
			) || 0;
		const dogalgaz_m3 =
			parseFloat(
				document.querySelector('input[name="dogalgaz_m3"]:checked').value
			) || 0;
		const halk_sayisi =
			parseFloat(
				document.querySelector('input[name="halk_sayisi"]:checked').value
			) || 1;
		const beslenme_tipi = document.querySelector(
			'input[name="beslenme_tipi"]:checked'
		).value;
		const su_dakika =
			parseFloat(
				document.querySelector('input[name="su_dakika"]:checked').value
			) || 0;
		const alisveris_urun =
			parseFloat(
				document.querySelector('input[name="alisveris_urun"]:checked').value
			) || 0;
		const elektronik_urun =
			parseFloat(
				document.querySelector('input[name="elektronik_urun"]:checked').value
			) || 0;
		const atik_tipi = document.querySelector(
			'input[name="atik_tipi"]:checked'
		).value;

		// yıllık faktörler
		const arac_yillik = arac_km * 52;
		const otobus_yillik = otobus_km * 52;
		const elektrik_yillik = elektrik_kwh * 12;
		const dogalgaz_yillik = dogalgaz_m3 * 12;
		const su_yillik = su_dakika * 365;
		const alisveris_yillik_giyim = alisveris_urun * 12;
		const alisveris_yillik_elektronik = elektronik_urun;

		const ulasim_emisyon =
			arac_yillik * emisyonFaktorleri.ulasim[yakit_tipi] +
			otobus_yillik * emisyonFaktorleri.ulasim.otobus +
			ucak_km * emisyonFaktorleri.ulasim.ucak;
		const enerji_emisyon =
			(elektrik_yillik * emisyonFaktorleri.enerji.elektrik +
				dogalgaz_yillik * emisyonFaktorleri.enerji.dogalgaz) /
			halk_sayisi;
		const beslenme_emisyon = emisyonFaktorleri.beslenme[beslenme_tipi];
		const su_emisyon = su_yillik * emisyonFaktorleri.su;
		const alisveris_emisyon =
			alisveris_yillik_giyim * emisyonFaktorleri.alisveris.giyim +
			alisveris_yillik_elektronik * emisyonFaktorleri.alisveris.elektronik;
		const atik_emisyon = emisyonFaktorleri.atik[atik_tipi];

		const toplam_karbon =
			ulasim_emisyon +
			enerji_emisyon +
			beslenme_emisyon +
			su_emisyon +
			alisveris_emisyon +
			atik_emisyon;

		kategoriVeri = {
			ulasim: ulasim_emisyon,
			enerji: enerji_emisyon,
			beslenme: beslenme_emisyon,
			su: su_emisyon,
			alisveris_atik: alisveris_emisyon + atik_emisyon,
		};

		const sonuc_metni = document.getElementById("sonuc_metni");
		const tahmini_aciklama = document.getElementById("tahmini_aciklama");

		const kategori_veri_dizi = Object.values(kategoriVeri);
		const kategori_isimleri_dizi = Object.values(kategoriIsimleri);

		const en_yuksek_kategori =
			kategori_isimleri_dizi[
				kategori_veri_dizi.indexOf(Math.max(...kategori_veri_dizi))
			];

		let sonuc;
		let aciklama;
		let oneriler = [];

		if (toplam_karbon < 2000) {
			sonuc = toplam_karbon.toFixed(2) + " kg";
			aciklama = `Karbon ayak iziniz oldukça düşük. Bu bilinçli yaşam tarzınız için tebrikler!`;
		} else if (toplam_karbon < 8000) {
			sonuc = (toplam_karbon / 1000).toFixed(2) + " ton";
			aciklama = `Karbon ayak iziniz ortalama seviyede. Daha fazlasını yapmak için küçük adımlar atabilirsiniz.`;
		} else {
			sonuc = (toplam_karbon / 1000).toFixed(2) + " ton";
			aciklama = `Karbon ayak iziniz ortalamanın üzerinde. Yaşam tarzınızda yapacağınız değişiklikler büyük etki yaratabilir.`;
		}

		// öneri listesi
		if (en_yuksek_kategori === kategoriIsimleri.ulasim) {
			oneriler.push(
				"Toplu taşıma veya bisiklet kullanmak, karbon ayak izinizi büyük ölçüde azaltacaktır."
			);
			oneriler.push(
				"Yakın mesafeler için aracınızı kullanmak yerine yürüyüşü veya bisikleti tercih edin."
			);
			oneriler.push(
				"Gereksiz uçuşlardan kaçının veya daha kısa mesafeli uçuşları tercih edin."
			);
		} else if (en_yuksek_kategori === kategoriIsimleri.enerji) {
			oneriler.push(
				"Evde enerji verimli A+++ sınıfı elektronik eşyalar kullanmayı düşünün."
			);
			oneriler.push(
				"Kullanmadığınız elektroniklerin fişini çekmek, bekleme modundaki enerji tüketimini önler."
			);
			oneriler.push(
				"Evinizi iyi izole ederek ısıtma ve soğutma giderlerinizi azaltın."
			);
		} else if (
			en_yuksek_kategori === kategoriIsimleri.beslenme ||
			en_yuksek_kategori === kategoriIsimleri.su
		) {
			if (en_yuksek_kategori === kategoriIsimleri.beslenme) {
				oneriler.push(
					"Daha fazla bitkisel bazlı ürün tüketmek, çevresel etkiyi azaltmada en etkili yollardan biridir."
				);
				oneriler.push(
					"Yerel ve mevsiminde üretilen gıdaları tercih ederek gıda taşıma maliyetlerini düşürün."
				);
			}
			if (en_yuksek_kategori === kategoriIsimleri.su) {
				oneriler.push(
					"Duş sürenizi kısaltmak, su tüketimini ve enerji ayak izini azaltır."
				);
				oneriler.push(
					"Sıhhi tesisatınızdaki sızıntıları onararak su israfını önleyin."
				);
			}
		} else if (en_yuksek_kategori === kategoriIsimleri.alisveris_atik) {
			oneriler.push("İkinci el ürünleri satın almayı düşünün.");
			oneriler.push(
				"Gereksiz ambalajlardan kaçınmak için kendi alışveriş çantanızı kullanın."
			);
			oneriler.push(
				"Atıklarınızı cam, kağıt, plastik ve organik olarak ayırarak geri dönüşümü artırın."
			);
		}

		sonuc_metni.innerText = `Yıllık Tahmini Karbon Ayak İziniz: ${sonuc}`;
		tahmini_aciklama.innerText = aciklama;

		const kategoriList = document.getElementById("kategori-list");
		kategoriList.innerHTML = "";
		kategori_isimleri_dizi.forEach((kategori, index) => {
			const li = document.createElement("li");
			li.innerHTML = `**${kategori}:** ${Math.max(
				0,
				(kategori_veri_dizi[index] / toplam_karbon) * 100
			).toFixed(1)}% (${(kategori_veri_dizi[index] / 1000).toFixed(2)} ton)`;
			kategoriList.appendChild(li);
		});

		const onerilerList = document.getElementById("oneriler-list");
		onerilerList.innerHTML = "";
		oneriler.forEach((oneri) => {
			const li = document.createElement("li");
			li.innerText = oneri;
			onerilerList.appendChild(li);
		});

		// senaryo analizi
		const senaryoEt = document.getElementById("senaryo_et");
		const beslenmeFark =
			(emisyonFaktorleri.beslenme.et - emisyonFaktorleri.beslenme.vejetaryen) /
			7;
		senaryoEt.innerText = `~${beslenmeFark.toFixed(2)} kg azalma`;

		const senaryoUlasim = document.getElementById("senaryo_ulasim");
		const yakitTipi = document.getElementById("yakit_tipi").value;
		const ulasimFark =
			50 * emisyonFaktorleri.ulasim[yakitTipi] -
			50 * emisyonFaktorleri.ulasim.otobus;
		senaryoUlasim.innerText = `~${ulasimFark.toFixed(2)} kg azalma`;

		const senaryoEnerji = document.getElementById("senaryo_enerji");
		const elektrikKwh =
			parseFloat(
				document.querySelector('input[name="elektrik_kwh"]:checked').value
			) || 0;
		const halkSayisi =
			parseFloat(
				document.querySelector('input[name="halk_sayisi"]:checked').value
			) || 1;
		const enerjiFark =
			(elektrikKwh * 0.1 * emisyonFaktorleri.enerji.elektrik * 12) / halkSayisi;
		senaryoEnerji.innerText = `~${enerjiFark.toFixed(2)} kg azalma`;

		renderChart(kategori_veri_dizi, kategori_isimleri_dizi);

		document.getElementById("loading-spinner").classList.add("hidden");
		document.getElementById("sonuc_alani").classList.remove("hidden");
	}, 1000);
}

function renderChart(data, labels) {
	const ctx = document.getElementById("karbonAyakIziChart").getContext("2d");
	if (myChart) {
		myChart.destroy();
	}
	myChart = new Chart(ctx, {
		type: "pie",
		data: {
			labels: labels,
			datasets: [
				{
					data: data,
					backgroundColor: [
						"rgba(245, 158, 11, 0.8)", // ulaşım
						"rgba(21, 128, 61, 0.8)", // enerji
						"rgba(234, 88, 12, 0.8)", // beslenme
						"rgba(59, 130, 246, 0.8)", // su
						"rgba(113, 113, 122, 0.8)", // alışveriş-atık
					],
					borderColor: [
						"rgba(245, 158, 11, 1)",
						"rgba(21, 128, 61, 1)",
						"rgba(234, 88, 12, 1)",
						"rgba(59, 130, 246, 1)",
						"rgba(113, 113, 122, 1)",
					],
					borderWidth: 1,
				},
			],
		},
		options: {
			responsive: true,
			plugins: {
				legend: {
					position: "top",
				},
				tooltip: {
					callbacks: {
						label: function (context) {
							let label = context.label || "";
							if (label) {
								label += ": ";
							}
							if (context.parsed !== null) {
								label +=
									new Intl.NumberFormat("tr-TR", { style: "decimal" }).format(
										context.parsed.toFixed(2)
									) + " kg";
							}
							return label;
						},
					},
				},
			},
		},
	});
}

function showMessage(text) {
	const messageBox = document.getElementById("message-box");
	messageBox.innerText = text;
	messageBox.classList.remove("hidden");
	messageBox.classList.add("show");
	setTimeout(() => {
		messageBox.classList.remove("show");
		setTimeout(() => {
			messageBox.classList.add("hidden");
		}, 300);
	}, 2000);
}

function sifirla() {
	document.getElementById("sonuc_alani").classList.add("hidden");
	document.getElementById("calculator-form").classList.remove("hidden");
	document.getElementById("progress-container").classList.remove("hidden");
	currentStep = 1;
	document.getElementById("step-1").classList.remove("hidden");
	document.getElementById("step-2").classList.add("hidden");
	document.getElementById("step-3").classList.add("hidden");
	document.getElementById("step-4").classList.add("hidden");
	updateProgressBar();
}

function kopyala() {
	const sonuc_metni = document.getElementById("sonuc_metni").innerText;
	const tahmini_aciklama =
		document.getElementById("tahmini_aciklama").innerText;
	const kategori_listesi = Array.from(
		document.querySelectorAll("#kategori-list li")
	)
		.map((li) => li.innerText)
		.join("\n");
	const oneriler_listesi = Array.from(
		document.querySelectorAll("#oneriler-list li")
	)
		.map((li) => "- " + li.innerText)
		.join("\n");
	const senaryo_et = document.getElementById("senaryo_et").innerText;
	const senaryo_ulasim = document.getElementById("senaryo_ulasim").innerText;
	const senaryo_enerji = document.getElementById("senaryo_enerji").innerText;

	const metin = `${sonuc_metni}\n\n${tahmini_aciklama}\n\nKategori Bazında Etki:\n${kategori_listesi}\n\nÖneriler:\n${oneriler_listesi}\n\nSenaryo Analizi:\n- Haftada bir gün et yemeyi bırakırsan: ${senaryo_et}\n- Araba yerine haftada 50 km otobüs kullanırsan: ${senaryo_ulasim}\n- Aylık elektrik tüketimini %10 azaltırsan: ${senaryo_enerji}`;

	// Create a temporary textarea to hold the text to be copied.
	const tempTextarea = document.createElement("textarea");
	tempTextarea.value = metin;
	tempTextarea.style.position = "absolute";
	tempTextarea.style.left = "-9999px";
	document.body.appendChild(tempTextarea);
	tempTextarea.select();

	try {
		const successful = document.execCommand("copy");
		if (successful) {
			showMessage("Sonuç panoya kopyalandı!");
		} else {
			showMessage("Kopyalama başarısız oldu. Lütfen tekrar deneyin.");
		}
	} catch (err) {
		console.error("Kopyalama başarısız:", err);
		showMessage("Kopyalama sırasında bir hata oluştu.");
	} finally {
		document.body.removeChild(tempTextarea);
	}
}

window.onload = updateProgressBar;
