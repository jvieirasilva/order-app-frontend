import Navbar from "./components/Navbar";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <div className="container py-5">
        <div className="text-center">
          <h1 className="display-4 mb-4">Welcome to Order App</h1>
          <p className="lead text-muted mb-4">
            Manage your users, products, and orders in one place
          </p>
          
          <div className="row g-4 mt-5">
            <div className="col-md-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <i className="bi bi-people-fill text-primary" style={{ fontSize: "3rem" }}></i>
                  <h5 className="card-title mt-3">Users</h5>
                  <p className="card-text">Manage user accounts and permissions</p>
                  <a href="/users/search" className="btn btn-primary">Go to Users</a>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <i className="bi bi-box-seam text-success" style={{ fontSize: "3rem" }}></i>
                  <h5 className="card-title mt-3">Products</h5>
                  <p className="card-text">Browse and manage your inventory</p>
                  <a href="/products" className="btn btn-success">Go to Products</a>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <i className="bi bi-cart-fill text-warning" style={{ fontSize: "3rem" }}></i>
                  <h5 className="card-title mt-3">Orders</h5>
                  <p className="card-text">Track and manage customer orders</p>
                  <a href="/orders" className="btn btn-warning">Go to Orders</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}