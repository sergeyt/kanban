require 'erb'

Vagrant.configure("2") do |config|

  config.vm.box = "precise32"
  config.vm.box_url = "http://files.vagrantup.com/precise32.box"
  config.vm.network :forwarded_port, guest: 3000, host: 3000

  config.vm.provider :virtualbox do |vb|
  	vb.customize ["setextradata", :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/v-root", "1"]
  end

  # Enable provisioning through a shell script.
  config.vm.provision :shell do |shell|
    relative     = ''
    script       = 'provision.sh'
    shell.inline = ERB.new("<% def import(file); File.read('#{relative}' + file); end %>" + File.read("#{relative}#{script}")).result
  end

end
