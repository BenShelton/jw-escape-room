import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";

const Attribution = () => {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {"Compliments of "}
      <Link color="inherit" href="https://julianhernandez.me">
        <strong>Brother App</strong>
      </Link>
    </Typography>
  );
};

export default Attribution;
