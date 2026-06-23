export class MenuHelper {
  static adminMenu() {
    return [
      {
        id: 'dashboard',
        title: 'Dashboard',
        icon: 'home',
        type: 'basic',
        link: '/dashboard-management',
        lock: false,
      },
      {
        id: 'users',
        title: 'Usuários',
        icon: 'people',
        type: 'basic',
        link: '/users-management',
        lock: false,
      },
      {
        id: 'products',
        title: 'Produtos',
        icon: 'inventory',
        type: 'basic',
        link: '/products-management',
        lock: false,
      },
      // {
      //   id: 'sales-management',
      //   title: 'Vendas',
      //   icon: 'shopping_cart',
      //   type: 'basic',
      //   link: '/sales-management',
      //   lock: false,
      // },
      {
        id: 'finance',
        title: 'Financeiro',
        icon: 'attach_money',
        type: 'basic',
        link: '/finance-management',
        lock: false,
      },
      {
        id: 'orders',
        title: 'Todas vendas',
        icon: 'shopping_cart',
        type: 'basic',
        link: '/orders-management',
        lock: false,
      },
    ];
  }
}
