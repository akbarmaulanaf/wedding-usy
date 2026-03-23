document.addEventListener("DOMContentLoaded", () => {
  // --- KONFIGURASI GOOGLE APPS SCRIPT ---
  const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbxCdF-JZJXzkhxJTbQsgjh1EwkBtrsq4G8q3d747MVPJJ2w1g7uT2NeRyz0HFKEM7xO/exec";

  // --- LOGIKA URL NAMA TAMU ---
  const urlParams = new URLSearchParams(window.location.search);
  const guestName = urlParams.get("to");
  const guestNameElement = document.getElementById("guest-name");
  const inputNamaForm = document.getElementById("input-nama");

  if (guestName) {
    guestNameElement.textContent = guestName;
    inputNamaForm.value = guestName;
  } else {
    guestNameElement.textContent = "Tamu Undangan";
  }

  // --- TRANSISI BUKA UNDANGAN ---
  const btnOpen = document.getElementById("open-invitation");
  const coverPage = document.getElementById("cover-page");
  const mainContent = document.getElementById("main-content");
  const bodyContainer = document.getElementById("body-container");

  btnOpen.addEventListener("click", () => {
    coverPage.style.opacity = "0";
    setTimeout(() => {
      coverPage.style.display = "none";
      bodyContainer.classList.remove("overflow-hidden");
      mainContent.classList.remove("invisible");
      void mainContent.offsetWidth;
      mainContent.style.opacity = "1";
    }, 1000);
  });

  // --- COUNTDOWN TIMER ---
  const countDownDate = new Date("Apr 12, 2026 08:00:00").getTime();
  const x = setInterval(function () {
    const now = new Date().getTime();
    const distance = countDownDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("days").textContent = days < 10 ? "0" + days : days;
    document.getElementById("hours").textContent = hours < 10 ? "0" + hours : hours;
    document.getElementById("minutes").textContent = minutes < 10 ? "0" + minutes : minutes;
    document.getElementById("seconds").textContent = seconds < 10 ? "0" + seconds : seconds;

    if (distance < 0) {
      clearInterval(x);
      document.getElementById("countdown").innerHTML = "<div class='text-xl text-wedding-gold font-serif glow-gold'>Acara Sedang/Telah Berlangsung</div>";
    }
  }, 1000);

  // --- SLIDER UCAPAN RSVP ---
  const wishesContainer = document.getElementById("wishes-container");
  const btnSlideLeft = document.getElementById("slide-left");
  const btnSlideRight = document.getElementById("slide-right");
  const scrollAmount = 340;

  btnSlideLeft.addEventListener("click", () => {
    wishesContainer.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  });
  btnSlideRight.addEventListener("click", () => {
    wishesContainer.scrollBy({ left: scrollAmount, behavior: "smooth" });
  });

  // --- SUBMIT FORM RSVP ---
  const rsvpForm = document.getElementById("rsvp-form");
  rsvpForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(rsvpForm);
    const nama = formData.get("nama");
    const jumlah = formData.get("jumlah");
    const status = formData.get("status");
    const pesan = formData.get("pesan") || "Selamat menempuh hidup baru!";

    // Ubah button menjadi loading state
    const submitBtn = rsvpForm.querySelector("button[type='submit']");
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = "⏳ Mengirim...";
    submitBtn.disabled = true;

    // Siapkan data untuk Google Sheets
    const dataToSend = {
      nama: nama,
      jumlah: jumlah,
      status: status,
      pesan: pesan,
    };

    // Kirim ke Google Apps Script
    fetch(WEBHOOK_URL, {
      method: "POST",
      body: JSON.stringify(dataToSend),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((result) => {
        // Jika berhasil kirim ke Google Sheet, tampilkan di slider
        if (result.success) {
          let statusBadge = "";
          if (status === "Hadir") {
            statusBadge = '<span class="text-[10px] bg-green-900/40 border border-green-700 text-green-400 px-2 py-1 rounded-full uppercase tracking-wider">Hadir</span>';
          } else if (status === "Tidak Hadir") {
            statusBadge = '<span class="text-[10px] bg-red-900/40 border border-red-700 text-red-400 px-2 py-1 rounded-full uppercase tracking-wider">Tidak Hadir</span>';
          } else {
            statusBadge = '<span class="text-[10px] bg-yellow-900/40 border border-yellow-700 text-yellow-400 px-2 py-1 rounded-full uppercase tracking-wider">Masih Ragu</span>';
          }

          const newCardHTML = `
            <div class="min-w-[280px] md:min-w-[320px] max-w-[320px] bg-wedding-black p-6 rounded-xl border border-wedding-gold/50 flex-shrink-0 flex flex-col justify-between shadow-[0_0_15px_rgba(212,175,55,0.1)]">
              <div>
                <div class="flex justify-between items-start mb-3">
                  <h4 class="text-wedding-gold font-semibold text-lg">${nama}</h4>
                  ${statusBadge}
                </div>
                <p class="text-gray-300 text-sm italic leading-relaxed">"${pesan}"</p>
              </div>
              <div class="mt-4 text-xs text-gray-500 text-right">Baru saja</div>
            </div>
          `;

          wishesContainer.insertAdjacentHTML("afterbegin", newCardHTML);
          wishesContainer.scrollTo({ left: 0, behavior: "smooth" });

          // Reset form
          rsvpForm.reset();
          rsvpForm.querySelector("textarea").value = "";
          rsvpForm.querySelectorAll("select").forEach((sel) => (sel.selectedIndex = 0));

          // Reset button
          submitBtn.textContent = originalBtnText;
          submitBtn.disabled = false;

          alert("✅ Terima kasih! Konfirmasi kehadiran dan ucapan Anda telah kami terima.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        // Jika error (mungkin URL belum diset), tetap tampilkan di slider
        let statusBadge = "";
        if (status === "Hadir") {
          statusBadge = '<span class="text-[10px] bg-green-900/40 border border-green-700 text-green-400 px-2 py-1 rounded-full uppercase tracking-wider">Hadir</span>';
        } else if (status === "Tidak Hadir") {
          statusBadge = '<span class="text-[10px] bg-red-900/40 border border-red-700 text-red-400 px-2 py-1 rounded-full uppercase tracking-wider">Tidak Hadir</span>';
        } else {
          statusBadge = '<span class="text-[10px] bg-yellow-900/40 border border-yellow-700 text-yellow-400 px-2 py-1 rounded-full uppercase tracking-wider">Masih Ragu</span>';
        }

        const newCardHTML = `
          <div class="min-w-[280px] md:min-w-[320px] max-w-[320px] bg-wedding-black p-6 rounded-xl border border-wedding-gold/50 flex-shrink-0 flex flex-col justify-between shadow-[0_0_15px_rgba(212,175,55,0.1)]">
            <div>
              <div class="flex justify-between items-start mb-3">
                <h4 class="text-wedding-gold font-semibold text-lg">${nama}</h4>
                ${statusBadge}
              </div>
              <p class="text-gray-300 text-sm italic leading-relaxed">"${pesan}"</p>
            </div>
            <div class="mt-4 text-xs text-gray-500 text-right">Baru saja</div>
          </div>
        `;

        wishesContainer.insertAdjacentHTML("afterbegin", newCardHTML);
        wishesContainer.scrollTo({ left: 0, behavior: "smooth" });

        // Reset form
        rsvpForm.reset();
        rsvpForm.querySelector("textarea").value = "";
        rsvpForm.querySelectorAll("select").forEach((sel) => (sel.selectedIndex = 0));

        // Reset button
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;

        alert("✅ Terima kasih! Konfirmasi kehadiran dan ucapan Anda telah kami terima.\n\n⚠️ Catatan: Data mungkin belum tersimpan di Google Sheet. Pastikan URL Google Apps Script sudah dikonfigurasi dengan benar.");
      });
  });
});

// --- FUNGSI COPY NOMOR REKENING / ALAMAT ---
// Diletakkan di global scope (luar DOMContentLoaded) agar bisa dipanggil onclick
window.copyRekening = function (elementId) {
  const textToCopy = document.getElementById(elementId).innerText.replace(/\s+/g, ""); // Hapus spasi pada nomor ATM
  const originalText = document.getElementById(elementId).innerText; // Jika untuk alamat

  // Cek apakah ini alamat atau nomor rekening
  const finalCopyText = elementId === "alamat-kado" ? originalText : textToCopy;

  navigator.clipboard
    .writeText(finalCopyText)
    .then(() => {
      // Tampilkan Toast Animation
      const toast = document.getElementById("toast");

      if (elementId === "alamat-kado") {
        toast.innerText = "Alamat Berhasil Disalin!";
      } else {
        toast.innerText = "Nomor Rekening Berhasil Disalin!";
      }

      toast.classList.remove("hidden");
      toast.classList.add("toast-animate");

      // Hilangkan toast setelah 3 detik
      setTimeout(() => {
        toast.classList.remove("toast-animate");
        toast.classList.add("hidden");
      }, 3000);
    })
    .catch((err) => {
      console.error("Gagal menyalin text: ", err);
      alert("Gagal menyalin, silakan salin manual.");
    });
};
