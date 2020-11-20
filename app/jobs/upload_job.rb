require 'httparty'
class UploadJob < ApplicationJob

  queue_as :default

  def perform(sp_upload_url, params)
    begin
      HTTParty.post(sp_upload_url,
        multipart: true,
        body: params
      )
    rescue Exception => e
    end
  end

end