// Token utilities
import { MODULE_ID } from '~/src/helpers/constants';

export async function maskWithRing(dataUrl, scale = 1.0) {
  // Attempt client-side masking if DOM canvas available; otherwise return original dataURL (no-op in tests)
  try {
    if (typeof document === 'undefined' || typeof document.createElement !== 'function') return dataUrl;
    const img = new Image();
    img.src = dataUrl;
    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });

    const size = Math.max(img.width, img.height) || 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Draw centered scaled image
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);

    // Clip to circle
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    const radius = size / 2;
    ctx.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
    ctx.fill();

    return canvas.toDataURL('image/png');
  } catch (e) {
    // In test envs without DOM, just return original
    return dataUrl;
  }
}

export async function saveTokenConfiguration({ actor, portraitDataUrl, maskWithRing: shouldMask = false, subjectScale = 1.0 }) {
  if (!actor || !actor.id) throw new Error('Actor required');

  let dataToUpload = portraitDataUrl;
  if (shouldMask) {
    dataToUpload = await maskWithRing(portraitDataUrl, subjectScale);
  }

  // Build a reasonable folder path; fall back to 'test' world when not available
  const worldName = (typeof game !== 'undefined' && game?.world?.name) ? game.world.name : 'test';
  const folder = `worlds/${worldName}/${MODULE_ID}/${actor.id}`;

  const uploadRes = await FilePicker.implementation.upload('data', folder, dataToUpload, {}, { notify: true });
  const savedPath = uploadRes.files && uploadRes.files[0];
  if (!savedPath) throw new Error('Upload failed');

  // Update the actor prototype token with ring settings
  await actor.update({
    prototypeToken: {
      texture: { src: savedPath },
      ring: { enabled: true, subject: { scale: subjectScale } }
    }
  });

  return savedPath;
}
