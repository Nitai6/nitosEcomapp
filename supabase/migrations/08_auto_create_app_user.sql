-- Auto-insert into app_users when a new auth user signs up via magic link.
-- First user becomes 'owner', rest become 'viewer' (tighten later as needed).
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.app_users (id, email, role)
  values (
    new.id,
    new.email,
    case when (select count(*) from public.app_users) = 0 then 'owner'::user_role else 'viewer'::user_role end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();
