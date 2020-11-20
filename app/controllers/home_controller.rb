class HomeController < ApplicationController
  def index; end

  def fetch_lead
    response = HTTParty.get(params[:sp_link])
    render json: JSON.parse(response.body)
  end

  def upload
    sp_upload_url = "#{helpers.backend_base_url}/api/v1/media/force_upload"
    # upload cmnd truoc
    HTTParty.post(sp_upload_url,
        multipart: true,
        body: {
          kind: 'cmnd_front',
          object_id: params[:object_id],
          object_type: params[:object_type],
          file: params[:cmnd_front]
        }
      )

    # upload cmnd sau
    HTTParty.post(sp_upload_url,
        multipart: true,
        body: {
          kind: 'cmnd_back',
          object_id: params[:object_id],
          object_type: params[:object_type],
          file: params[:cmnd_back]
        }
      )
    # upload eKYC
    # response = HTTParty.post(sp_upload_url,
    #     multipart: true,
    #     body: {
    #       kind: params[:kind],
    #       object_id: params[:object_id],
    #       object_type: params[:object_type],
    #       file: params[:cmnd_front]
    #     }
    #   )

    respond_to do |format|
      format.js
      format.html
    end
  end
end
