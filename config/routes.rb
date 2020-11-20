Rails.application.routes.draw do
  root 'home#index'

  post 'fetch_lead', to: 'home#fetch_lead'
  post 'upload', to: 'home#upload'
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
end
