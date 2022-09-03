const authController = require('../app/https/controllers/authController');
const cartController = require('../app/https/controllers/customers/cartController');
const homeController = require('../app/https/controllers/homeController')
const orderController = require('../app/https/controllers/customers/orderController')
const statusController = require('../app/https/controllers/admin/statusController')
const adminOrderController = require('../app/https/controllers/admin/orderController')
// Middlewares 
const guest = require('../app/https/middleware/guest')
const auth = require('../app/https/middleware/auth')
const admin = require('../app/https/middleware/admin')



function initRouters(app) {
    // home  Route
    app.get("/", homeController().index)

    // cart route
    app.get("/cart", cartController().index);
    app.post('/update-cart', cartController().update)

    // login Route
    app.get("/login", guest, authController().login);
    app.post("/login", authController().postLogin);

    // register Route
    app.get("/register", guest, authController().register);
    app.post("/register", authController().postRegister);

    // customer route
    app.post('/orders', auth, orderController().store)
    app.get('/customer/orders', auth, orderController().index)
    app.get('/customer/orders/:id', auth, orderController().show)

    //logout route
    app.post('/logout', function (req, res, next) {
        req.logout(function (err) {
            if (err) { return next(err); }
            res.redirect('/login');
        });
    });

    // admin Route
    app.get('/admin/orders', admin, adminOrderController().index)
    app.post('/admin/order/status', admin, statusController().update)

}

module.exports = initRouters