import test from 'node:test';
import assert from 'node:assert/strict';

import { getOptimizedImageUrl } from './imageUtils.js';

test('preserves non-cloudinary images', () => {
  assert.equal(getOptimizedImageUrl('/images/sample.jpg'), '/images/sample.jpg');
});

test('adds cloudinary optimization params to cloudinary urls', () => {
  const original = 'https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg';
  const optimized = getOptimizedImageUrl(original, { width: 400 });

  assert.match(optimized, /q=auto/);
  assert.match(optimized, /f=auto/);
  assert.match(optimized, /w=400/);
  assert.match(optimized, /sample\.jpg/);
});
