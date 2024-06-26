const Order = require('../models/Order');
const Booking = require('../models/Booking');
const OrderDetail = require('../models/OrderDetail');
const User = require('../models/User')

const getTotalOrderByDate = async (req, res) => {
    try {
        let { startDate, endDate } = req.query;

        // kiểm tra nếu ngày bắt đầu và ngày kết thúc chưa có
        if (!startDate || !endDate) {
            const totalOrders = await Order.find({status: 'Đã nhận hàng'});
            return res.status(200).json({ totalOrders });
        }

        startDate = new Date(startDate);
        endDate = new Date(endDate);

        // lấy những đơn hàng có trạng thái "Đã nhận hàng" trong khoảng từ startDate đến endDate
        const totalOrders = await Order.find({
            status: 'Đã nhận hàng',
            createdAt: { $gte: startDate, $lte: endDate },
        });

        res.status(200).json({ totalOrders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getTotalRevenueByDate = async (req, res) => {
    try {
        let { startDate, endDate } = req.query;
        // Kiểm tra kiểm tra nếu ngày bắt đầu và ngày kết thúc chưa có
        if (!startDate || !endDate) {
            // Nếu không có dữ liệu đầu vào thì lấy tất cả đơn hàng có trạng thái "Đã nhận hàng"
            const totalRevenue = await Order.aggregate([
                {
                    $match: {
                        status: 'Đã nhận hàng',
                    },
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$totalPrice' },
                    },
                },
            ]);
            return res.status(200).json(totalRevenue)
        } else {
            startDate = new Date(startDate);
            endDate = new Date(endDate);
        }
        const totalRevenue = await Order.aggregate([
            {
                $match: {
                    status: 'Đã nhận hàng',
                    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalPrice' },
                },
            },
        ]);
        res.status(200).json(totalRevenue)
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getTotalCustomer = async (req, res) => {
    try {
        let { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            // Nếu không có startDate và endDate, lấy tất cả userId không lặp lại từ các đơn hàng có trạng thái "Đã nhận hàng"
            const userIds = await Order.distinct('userId', { status: 'Đã nhận hàng' });
            const totalCustomers = userIds.length;
            return res.status(200).json({ totalCustomers, userIds });
        }

        startDate = new Date(startDate);
        endDate = new Date(endDate);

        // lấy tất cả userId không lặp lại từ các đơn hàng có trạng thái "Đã nhận hàng" và tạo từ startDate đến endDate
        const userIds = await Order.distinct('userId', {
            status: 'Đã nhận hàng',
            createdAt: { $gte: startDate, $lte: endDate },
        });

        const totalCustomers = userIds.length;

        res.status(200).json({ totalCustomers, userIds });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getTotalProductsSoldByDate = async (req, res) => {
    try {
        let { startDate, endDate } = req.query;
        // Kiểm tra xem startDate và endDate có tồn tại trong request query không
        if (!startDate || !endDate) {
            // Nếu không có dữ liệu đầu vào, láy từ tất cả các đơn hàng
            const totalProductsSold = await OrderDetail.aggregate([
                {
                    $lookup: {
                        from: 'orders',
                        localField: 'orderId',
                        foreignField: '_id',
                        as: 'order',
                    },
                },
                {
                    $unwind: '$order',
                },
                {
                    $match: {
                        'order.status': 'Đã nhận hàng',
                    },
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$quantity' },
                    },
                },
            ]);
    
            return res.status(200).json(totalProductsSold)
        } else {
            startDate = new Date(startDate);
            endDate = new Date(endDate);
        }
        const totalProductsSold = await OrderDetail.aggregate([
            {
                $lookup: {
                    from: 'orders',
                    localField: 'orderId',
                    foreignField: '_id',
                    as: 'order',
                },
            },
            {
                $unwind: '$order',
            },
            {
                $match: {
                    'order.status': 'Đã nhận hàng',
                    'order.createdAt': { $gte: new Date(startDate), $lte: new Date(endDate) },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$quantity' },
                },
            },
        ]);

        res.status(200).json(totalProductsSold)
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getRevenueStatistics = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const pipeline = [
            {
                $match: {
                    createdAt: {
                        $gte: new Date(`${currentYear}-01-01`),
                        $lte: new Date(`${currentYear}-12-31`),
                    },
                    status: 'Đã nhận hàng', // Chỉ lấy các đơn hàng đã hoàn thành (hoặc trạng thái tương ứng)
                },
            },
            {
                $group: {
                    _id: { month: { $month: '$createdAt' } },
                    total: { $sum: '$totalPrice' },
                },
            },
        ];

        const result = await Order.aggregate(pipeline);

        // Tạo mảng kết quả chứa doanh thu cho từng tháng
        const revenueByMonth = Array.from({ length: 12 }, (_, i) => {
            const monthData = result.find((item) => item._id.month === i + 1);
            return {
                month: i + 1,
                total: monthData ? monthData.total : 0,
            };
        });

        res.status(200).json({ revenueByMonth })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
        // res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    getTotalOrderByDate,
    getTotalRevenueByDate,
    getTotalCustomer,
    getTotalProductsSoldByDate,
    getRevenueStatistics
}
