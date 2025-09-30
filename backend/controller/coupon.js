const express = require('express');
const router = express.Router();
const Coupon = require('../schema/Coupon');

router.post('/add', async (req, res) => {
  try {
    // return res.json(req.body)
    const { startDate, endDate, couponCode, discount, discountType, maxDiscount, minPurchase, maxUsage, category } = req.body;

    // Validate couponCode: only allow alphanumeric (no special chars or whitespace)
    if (!/^[A-Za-z0-9]+$/.test(couponCode)) {
      return res.redirect(`/admin/coupon/new?error=Coupon code must not contain special characters or whitespace`);
    }

    const coupon = new Coupon({ startDate, endDate, couponCode: couponCode.toUpperCase(), discount, discountType, maxDiscount, minPurchase, maxUsage, category });
    await coupon.save();
    res.redirect(`/admin/coupon/new?message=Coupon created successfully`);
  } catch (error) {
    res.redirect(`/admin/coupon/new?error=${error.message}`);
  }
});

router.post('/delete', async (req, res) => {
  try {
    // return res.json(req.body)
    const { id } = req.body;
    await Coupon.findByIdAndDelete(id);
    res.redirect(`/admin/coupon/list?message=Coupon deleted successfully`);
  } catch (error) {
    res.redirect(`/admin/coupon/list?error=${error.message}`);
  }
});

router.post('/validate', async (req, res) => {
  try {
    const { couponCode, cartTotal, categoryId } = req.body;
    if (!couponCode) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({ couponCode: couponCode.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    const now = new Date();

    // Check validity dates
    if (now < coupon.startDate || now > coupon.endDate) {
      return res.status(400).json({ success: false, message: 'Coupon is expired or not yet active' });
    }

    // Check usage limit
    if (coupon.maxUsage && coupon.used >= coupon.maxUsage) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }

    // Check minimum purchase
    if (coupon.minPurchase && cartTotal < coupon.minPurchase) {
      return res.status(400).json({ success: false, message: `Minimum purchase of $${coupon.minPurchase} required to use this coupon` });
    }

    // // Check category eligibility (if provided)
    // if (categoryId && coupon.categories.length > 0 && !coupon.categories.includes(categoryId)) {
    //   return res.status(400).json({ success: false, message: 'Coupon not valid for selected category' });
    // }

    // Calculate discount
    let discountValue = 0;
    if (coupon.discountType === 'percentage') {
      discountValue = (coupon.discount / 100) * cartTotal;
      if (coupon.maxDiscount && discountValue > coupon.maxDiscount) {
        discountValue = coupon.maxDiscount;
      }
    } else if (coupon.discountType === 'fixed') {
      discountValue = coupon.discount;
    }

    return res.status(200).json({
      success: true,
      message: 'Coupon is valid',
      discountType: coupon.discountType,
      discountValue,
      coupon: coupon._doc
    });

  } catch (err) {
    console.error('Coupon validation error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router