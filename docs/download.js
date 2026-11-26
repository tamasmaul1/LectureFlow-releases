const stableFeed = 'https://raw.githubusercontent.com/tamasmaul1/LectureFlow-releases/main/stable.json';
const releaseDownloads = 'https://github.com/tamasmaul1/LectureFlow-releases/releases/download/';

function readWindowsInstaller(feed) {
  const release = feed?.release;
  const version = release?.version;
  const artifact = release?.platforms?.['windows-x86_64-nsis'];
  if (release?.schema !== 1 || release.channel !== 'stable' || typeof version !== 'string'
    || !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)
    || !Number.isSafeInteger(artifact?.bytes) || artifact.bytes <= 0 || typeof artifact.url !== 'string') {
    throw new Error('Invalid stable Windows release');
  }

  const prefix = `${releaseDownloads}v${version}/`;
  if (!artifact.url.startsWith(prefix) || !/^[A-Za-z0-9][A-Za-z0-9._-]*\.exe$/i.test(artifact.url.slice(prefix.length))) {
    throw new Error('Unexpected Windows installer URL');
  }
  return { version, bytes: artifact.bytes, url: artifact.url };
}

function initializeDownload() {
  const download = document.querySelector('[data-download]');
  const releaseInfo = document.querySelector('[data-release-info]');
  const status = document.querySelector('[data-download-status]');
  const sizeFormat = new Intl.NumberFormat(document.documentElement.lang, {
    style: 'unit', unit: 'megabyte', unitDisplay: 'short', maximumFractionDigits: 0,
  });
  let loading = true;

  const resolveDownload = async () => {
    try {
      const response = await fetch(stableFeed, {
        cache: 'no-store', credentials: 'omit', redirect: 'error', signal: AbortSignal.timeout(6000),
      });
      if (!response.ok) throw new Error(`Stable feed returned ${response.status}`);
      const { version, bytes, url } = readWindowsInstaller(await response.json());
      releaseInfo.textContent = ` · v${version} · ${sizeFormat.format(bytes / 1_000_000)}`;
      download.href = url;
    } catch {
      status.textContent = status.dataset.unavailable;
      status.hidden = false;
    } finally {
      loading = false;
    }
  };

  const resolved = resolveDownload();
  download.addEventListener('click', async (event) => {
    if (!loading || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    download.setAttribute('aria-busy', 'true');
    await resolved;
    if (!download.hasAttribute('aria-busy')) return;
    download.removeAttribute('aria-busy');
    window.location.assign(download.href);
  });
  download.inert = false;
}

function initializeWorkflowAnimations() {
  if (!globalThis.IntersectionObserver || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const visibilityThreshold = 0.75;
  const unplayed = new Set(document.querySelectorAll('.lf-visual'));
  const observer = new IntersectionObserver((entries) => {
    for (const { target, intersectionRatio } of entries) {
      if (intersectionRatio < visibilityThreshold || !target.classList.contains('lf-motion-enabled')) continue;
      target.classList.add('lf-animate');
      observer.unobserve(target);
      unplayed.delete(target);
    }
    if (!unplayed.size) window.removeEventListener('resize', updateUnplayed);
  }, { threshold: visibilityThreshold });

  function updateUnplayed() {
    // Keep the finished state visible whenever the window is too short to play it.
    for (const visual of unplayed) {
      const fits = visual.getBoundingClientRect().height * visibilityThreshold <= window.innerHeight;
      visual.classList.toggle('lf-motion-enabled', fits);
      if (fits) observer.observe(visual);
      else observer.unobserve(visual);
    }
  }

  window.addEventListener('resize', updateUnplayed);
  updateUnplayed();
}

initializeDownload();
initializeWorkflowAnimations();
